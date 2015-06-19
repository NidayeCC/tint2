if(typeof(process.bridge) === 'undefined') {
  process.initbridge();
}
if(typeof(process.bridge.dotnet) === 'undefined') {
  process.bridge.dotnet = {};
}
if(typeof(process.bridge.ref) === 'undefined') {
  process.bridge.ref = require('ref');
}
if(typeof(process.bridge.struct) === 'undefined') {
  process.bridge.struct = require('struct');
}
if(typeof(process.bridge.ffi) === 'undefined') {
  process.bridge.ffi = require('ffi');
}
if(typeof(process.bridge.win32) === 'undefined') {
  process.bridge.win32 = require('win32');
}
var assert = require('assert');
var dotnet = process.bridge;
var assemblyImported = {};
var classCache = {};
dotnet.statistics = {assemblies_hit:0, assemblies_miss:0, enums:0,values:0,classes:0,fields:0,properties:0,events:0,methods:0,cachehit:0,cachemiss:0};


function unwrap(a) {
  if(a && a.pointer) {
    return a.pointer;
  } else if(a && a.classPointer) {
    return a.classPointer;
  } else {
    return a;
  }
}

function unwrapValues(e) {
  if(Array.isArray(e)) {
    var unwrapped = [];
    for(var i=0; i < e.length; i++) {
      unwrapped[i] = unwrap(e[i]);
    }
    return unwrapped;
  } else {
    return unwrap(e);
  }
}

function wrap(b) {
  if(Buffer.isBuffer(b) && !b.array) {
    return createJSInstance(b);
  } else {
    return b;
  }
}

function typeSignature(memberName, args) {
  var signature = memberName, unwrappedArgs = [];
  for(var i=0; i < args.length; i++) {
    if(args[i] && args[i].className) {
      signature += args[i].className;
    } else if(typeof(args[i]) === 'string') {
      signature += 'String';
    } else if (typeof(args[i] === 'number' && args[i] % 1 === 0)) {
      signature += 'Integer';
    } else if (typeof(args[i] === 'number' && args[i] % 1 !== 0)) {
      signature += 'Double';
    } else if (typeof(args[i]) === 'boolean') {
      signature += 'Boolean';
    } else if (typeof(args[i]) === 'undefined' || args[i] === null) {
      signature += 'null';
    } else if (Array.isArray(args[i])) {
      signature += 'Array';
    } else {
      signature += 'Object';
    }
    unwrappedArgs.push(unwrap(args[i]));
  }
  return {signature:signature, unwrappedArgs:unwrappedArgs};
}


/* The proto class is a "non sealed" class that can be used
 * to create new classes in dotnet, it's just a weak object
 * that shortens the API */
function ProtoClass(name, base) {
  this.protoPointer = dotnet.classCreate(name,unwrap(base),[],[]);

  this.addConstructor = function(public, types, callback) {
    public = public ? "public" : "private";
    dotnet.classAddConstructor(this.protoPointer,public,unwrapValues(types),callback);
  };

  this.addMethod = function(name, static, public, override, retType, types, callback) {
    public = public ? "public" : "private";
    dotnet.classAddMethod(this.protoPointer,name,public,static,override,unwrapValues(retType),unwrapValues(types),callback);
  };

  this.addProperty = function(name, static, public, readOnly, propType, value) {
    public = public ? "public" : "private";
    dotnet.classAddProperty(this.protoPointer,name,public,static,readOnly,unwrap(propType),unwrap(value));
  };

  this.addField = function(name, static, public, readOnly, propType, value) {
    public = public ? "public" : "private";
    dotnet.classAddField(this.protoPointer,name,public,static,readOnly,unwrap(propType),unwrap(value));
  };

  this.register = function() {
    return createClass(dotnet.classRegister(this.protoPointer), name);
  }
}


/* These enums, methods, fields and properties are created
 * by the following functions */


function createEnum(typeNative) {
  var names = dotnet.execMethod(typeNative,"GetEnumNames");
  var values = dotnet.execMethod(typeNative,"GetEnumValues");
  var nameEnumerator = dotnet.execMethod(names, "GetEnumerator");
  var valueEnumerator = dotnet.execMethod(values, "GetEnumerator");
  var obj = {};
  dotnet.statistics.enums++;
  while(dotnet.execMethod(nameEnumerator,'MoveNext') && 
        dotnet.execMethod(valueEnumerator, 'MoveNext'))
  {
    dotnet.statistics.values++;
    var ename = dotnet.execGetProperty(nameEnumerator, 'Current');
    var evalue = dotnet.execGetProperty(valueEnumerator, 'Current');
    obj[ename] = evalue;
    obj[ename].Name = dotnet.execMethod(evalue, "ToString");
  }
  return obj;
}

function createField(target, typeNative, memberName, static) {
  dotnet.statistics.fields++;
  var objdest = static ? target : target.prototype;
  if(!objdest.hasOwnProperty(memberName)) {
    Object.defineProperty(objdest, memberName, {
      configurable:true,
      enumerable:true,
      get:function() {
        if(static) {
          return wrap(dotnet.execGetStaticField(this.classPointer, memberName));
        } else {
          return wrap(dotnet.execGetField(this.pointer, memberName));
        }
      },
      set:function(e) { 
        dotnet.execSetField((static ? this.classPointer : this.pointer),memberName,unwrap(e)); 
      }
    });
  }
}

function createMethod(target, typeNative, memberName, static) {
  dotnet.statistics.methods++;
  var objdest = static ? target : target.prototype;
  var getobj = static ? dotnet.getStaticMethodObject : dotnet.getMethodObject;
  
  var prepargs = function() {
    var s = typeSignature(memberName, arguments);

    if(!this._methods) {
      this._methods = {};
    }
    if(!this._methods[s.signature]) {
      var mArgs = [this.classPointer, memberName].concat(s.unwrappedArgs);
      this._methods[s.signature] = getobj.apply(null, mArgs);
    }
    return [this._methods[s.signature], static ? null : this.pointer].concat(s.unwrappedArgs);
  };
  objdest[memberName] = function() {
    return wrap(dotnet.callMethod.apply(null, prepargs.apply(this,arguments)));
  };
  objdest[memberName+"Async"] = function() {
    dotnet.callMethodAsync.apply(null, prepargs.apply(this,arguments));
  };
}

function createProperty(target, typeNative, memberName, static) {
  dotnet.statistics.properties++;
  var objdest = static ? target : target.prototype;
  Object.defineProperty(objdest, memberName, {
    configurable:true,
    enumerable:true,
    get:function() {
      if(!this.props) {
        this.props={};
      }
      if(!this.props[memberName]) {
        this.props[memberName] = static ? 
          dotnet.getStaticPropertyObject(this.classPointer, memberName) : 
          dotnet.getPropertyObject(this.pointer, memberName);
      }
      if(typeof(this.props[memberName]) !== 'undefined' && this.props[memberName] !== null) {
        return wrap(dotnet.getProperty(this.props[memberName], static ? null : this.pointer)); 
      } else {
        return null;
      }
    },
    set:function(e) {
      if(!this.props) {
        this.props={};
      }
      if(!this.props[memberName]) {
        this.props[memberName] = static ? 
          dotnet.getStaticPropertyObject(this.classPointer, memberName) : 
          dotnet.getPropertyObject(this.pointer, memberName);
      }
      dotnet.setProperty(this.props[memberName], static ? null : this.pointer, unwrap(e));
    }
  });
}


function CLRClass() {
}

CLRClass.prototype.toString = function() { 
  return (this.pointer ? 'Object ' : 'Class ') + this.className + '';
};
CLRClass.prototype.inspect = function() { 
  return '\033[33m CLR ' + this.toString() + '\033[39m'; 
};
CLRClass.addEventListener = CLRClass.prototype.addEventListener = function(event, callback) {
  dotnet.execAddEvent(this.pointer ? this.pointer : this.classPointer, event, callback); 
};
// TODO:
CLRClass.removeEventListener = CLRClass.prototype.removeEventListener = function() {}

function createClass(typeNative, typeName) {
  dotnet.statistics.classes++;
  var qualifiedName = dotnet.execGetProperty(typeNative,'AssemblyQualifiedName');
  if(classCache[qualifiedName]) {
    return classCache[qualifiedName];
  }

  // These must be available on both the static and instance of the class/object.
  var CLRClassInstance = function() {
    var args = [this.classPointer];
    for(var i=0; i < arguments.length; i++) {
      args.push(unwrap(arguments[i]));
    }
    this.pointer = dotnet.execNew.apply(null,args);
  };
  CLRClassInstance.prototype = Object.create(CLRClass.prototype);
  CLRClassInstance.prototype.constructor = CLRClassInstance;
  CLRClassInstance.prototype.classPointer = CLRClassInstance.classPointer = typeNative;
  CLRClassInstance.prototype.className = CLRClassInstance.className = typeName;
  CLRClassInstance.prototype.extend = CLRClassInstance.extend = function(name) { return new ProtoClass(name,typeNative); }
  CLRClassInstance.addEventListener = CLRClassInstance.prototype.addEventListener = function(event, callback) {
    dotnet.execAddEvent(this.pointer ? this.pointer : this.classPointer, event, callback); 
  };
  var iterateThroughMembers = function(types, static) {
    var typeEnumerator = dotnet.execMethod(types,'GetEnumerator');
    while(dotnet.execMethod(typeEnumerator, "MoveNext")) {
      var mNative = dotnet.execGetProperty(typeEnumerator, 'Current');
      var mName = dotnet.execGetProperty(mNative, 'Name');
      var type = dotnet.execMethod(dotnet.execGetProperty(mNative, 'MemberType'), 'ToString');
      if(type === "Field") {
        createField(CLRClassInstance, typeNative, mName, static);
      } else if(type === "Method") {
        if(mName.substring(0,4) !== "get_" && mName.substring(0,4) !== "set_") {
          createMethod(CLRClassInstance, typeNative, mName, static);
        }
      } else if(type === "Property") {
        createProperty(CLRClassInstance, typeNative, mName, static);
      }
    }
  };

  iterateThroughMembers(dotnet.getStaticMemberTypes(typeNative), true);
  iterateThroughMembers(dotnet.getMemberTypes(typeNative), false);

  classCache[qualifiedName] = CLRClassInstance;
  return classCache[qualifiedName];
}

function createJSInstance(pointer) {
  var typeNative = dotnet.getCLRType(pointer);
  var typeName = dotnet.execGetProperty(typeNative, 'Name');

  if(dotnet.execGetProperty(typeNative, "IsEnum")) {
    dotnet.statistics.enums++;
    var fullName = dotnet.execGetProperty(typeNative, "FullName");
    var v = fullName.split('.');
    var enumValue = dotnet.execMethod(pointer,'ToString');
    v.push(enumValue);
    var dst = process.bridge.dotnet;
    for(var i=0; i < v.length ; i++) {
      dotnet.statistics.values++;
      dst = dst[v[i]];
    }
    return dst;
  } else if(dotnet.execGetProperty(typeNative, "IsClass") || dotnet.execGetProperty(typeNative, "IsValueType")) {
    dotnet.statistics.classes++;
    var c = createClass(typeNative, typeName);
    var N = function() { this.pointer = pointer; };
    N.prototype = Object.create(c.prototype);
    N.prototype.constructor = N;
    return new N();
  }
}

/* Entry point for assemblies, all assemblies are loaded in from 
 * the createFromType and ImportOnto functions, they are lazy loaded,
 * meaning they create a way to address the object in javascript but do not
 * actually load the "heavier" information until the class/enum/etc is 
 * used by the user, this costs CPU cycles initially but saves loading all
 * of the meta data from the CLR, initial tests saves 100MB of memory.
 */
function createFromType(nativeType, onto) {
  if(dotnet.execGetProperty(nativeType, "IsPublic")) {
    var name = dotnet.execGetProperty(nativeType,"Name");
    var space = dotnet.execGetProperty(nativeType,"Namespace");
    var info = { onto:onto, type:nativeType, name:name };
    
    if(space) {
      var spl = space.split('.');
      for(var i=0; i < spl.length; i++) {
        if(!info.onto[spl[i]]) {
          info.onto[spl[i]] = {};
        }
        info.onto = info.onto[spl[i]];
      }
    }

    Object.defineProperty(info.onto, name, {
      configurable:true, enumerable:true,
      get:function() { 
        delete this.onto[this.name];
        if(dotnet.execGetProperty(this.type, "IsEnum")) {
          this.onto[this.name] = createEnum(this.type,this.name);
        } else if (dotnet.execGetProperty(this.type, "IsClass") || dotnet.execGetProperty(this.type, "IsValueType")) {
          this.onto[this.name] = createClass(this.type,this.name);
        }
        return this.onto[this.name];
      }.bind(info)
    });
  }
}

/* Import onto the object specified, this takes an assembly, and loads
 * the classes, enums, fields, properties, etc onto the object passed in (onto)
 */
function importOnto(assembly, onto) {
  if(assembly.toLowerCase().indexOf('.dll') === -1 && assembly.toLowerCase().indexOf('.exe') === -1) {
    assembly += ".dll";
  }

  var types = dotnet.loadAssembly(assembly);
  var typeEnumerator = dotnet.execMethod(types, "GetEnumerator");

  while(dotnet.execMethod(typeEnumerator, "MoveNext")) {
    var type = dotnet.execGetProperty(typeEnumerator,'Current');
    createFromType(type, onto);
  }
}

function imports (e) {
  if(!assemblyImported[e]) {
    dotnet.statistics.assemblies_miss++;
    importOnto(e, process.bridge.dotnet);
  } else {
    dotnet.statistics.assemblies_hit++;
  }
  assemblyImported[e] = true;
}

process.bridge.dotnet.import = imports;
process.bridge.dotnet.Import = imports;

process.bridge.dotnet.importonto = importOnto;
process.bridge.dotnet.Importonto = importOnto;
process.bridge.dotnet.fromPointer = createJSInstance;
process.bridge.dotnet.import(process.execPath);
