var ffi = require('ffi'),
    ref = require('ref'),
    Struct = require('struct'),
    type = ref.Type,
    NULL = ref.NULL,
    isNull = ref.isNull;
 
var win32 = {}; 
module.exports = win32;

win32.NULL = ref.NULL;
win32.isNull = ref.isNull;
win32.structs = {};
 
var types = win32.types = {};
var
 VOID = types.void = ffi.types.void,
 bool = types.bool = ffi.types.bool,
 int8 = types.int8 = ffi.types.int8,
 uint8 = types.uint8 = ffi.types.uint8,
 int16 = types.int16 = ffi.types.int16,
 uint16 = types.uint16 = ffi.types.uint16,
 int32 = types.int32 = ffi.types.int32,
 uint32 = types.uint32 = ffi.types.uint32,
 int64 = types.int64 = ffi.types.int64,
 uint64 = types.uint64 = ffi.types.uint64,
 float = types.float = ffi.types.float,
 double = types.double = ffi.types.double,
 byte = types.byte = ffi.types.byte,
 char = types.char = ffi.types.char,
 uchar = types.uchar = ffi.types.uchar,
 short = types.short = ffi.types.short,
 ushort = types.ushort = ffi.types.ushort,
 int = types.int = ffi.types.int,
 uint = types.uint = ffi.types.uint,
 long = types.long = ffi.types.long,
 ulong = types.ulong = ffi.types.ulong,
 longlong = types.longlong = ffi.types.longlong,
 ulonglong = types.ulonglong = ffi.types.ulonglong,
 size_t = types.size_t = ffi.types.size_t,
 string = types.CString = ffi.types.CString,
 VOIDPTR = TYPEDEF('VOIDPTR', PTR(VOID));
 
function PTR(type){
  return ref.refType(type);
}
 
function TYPEDEF(name, type){
  return win32.types[name] = type;
  //return type.typedef(name);
}
function STRUCT(name, fields){
  return win32.structs[name] = Struct(fields);
}
 
function ENUM(name, values){
  var enumeration = lookup.enums[name] = new Enumeration(values);
  enumeration.name = name;
  return enumeration;
}
 
function LIBRARY(name, functions){
  return lookup.libs[name] = new Library(name, functions);
}
 
function ARRAY(type, length){
  var fields = {};
  Array.apply(null, new Array(length)).forEach(function(x, i){
    fields[i] = type;
  });
  return STRUCT(type.name+'x'+length, fields);
}
 
function Enumeration(values){
  this._keys = new Map;
  this._values = new Map;
  Object.keys(values).forEach(function(key){
    this._keys.set(key, values[key]);
    this._values.set(values[key], key);
    this[key] = values[key];
  }, this);
}
 
Enumeration.prototype.toKey = function toKey(v){
  if (this._keys.has(v)) {
    return v;
  } else {
    return this._values.get(v);
  }
};
 
Enumeration.prototype.toValue = function toValue(v){
  if (this._values.has(v)) {
    return v;
  } else {
    return this._keys.get(v);
  }
};
 
 
var
 uintptr_t = TYPEDEF('uintptr_t', uint),
 va_list = TYPEDEF('va_list', PTR(int8)),
 size_t = TYPEDEF('size_t', uint),
 rsize_t = TYPEDEF('rsize_t', uint),
 wchar_t = TYPEDEF('wchar_t', ushort),
 wint_t = TYPEDEF('wint_t', ushort),
 wctype_t = TYPEDEF('wctype_t', ushort),
 errno_t = TYPEDEF('errno_t', int),
 ULONG = TYPEDEF('ULONG', ulong),
 PULONG = TYPEDEF('PULONG', PTR(ulong)),
 USHORT = TYPEDEF('USHORT', ushort),
 PUSHORT = TYPEDEF('PUSHORT', PTR(ushort)),
 UCHAR = TYPEDEF('UCHAR', uchar),
 PUCHAR = TYPEDEF('PUCHAR', PTR(uchar)),
 DWORD = TYPEDEF('DWORD', ulong),
 BOOL = TYPEDEF('BOOL', int),
 BYTE = TYPEDEF('BYTE', uchar),
 WORD = TYPEDEF('WORD', ushort),
 FLOAT = TYPEDEF('FLOAT', float),
 PFLOAT = TYPEDEF('PFLOAT', PTR(float)),
 PBOOL = TYPEDEF('PBOOL', PTR(int)),
 LPBOOL = TYPEDEF('LPBOOL', PTR(int)),
 PBYTE = TYPEDEF('PBYTE', PTR(uchar)),
 LPBYTE = TYPEDEF('LPBYTE', PTR(uchar)),
 LPINT = TYPEDEF('LPINT', PTR(int)),
 PWORD = TYPEDEF('PWORD', PTR(ushort)),
 LPWORD = TYPEDEF('LPWORD', PTR(ushort)),
 LPLONG = TYPEDEF('LPLONG', PTR(long)),
 PDWORD = TYPEDEF('PDWORD', PTR(ulong)),
 LPDWORD = TYPEDEF('LPDWORD', PTR(ulong)),
 LPVOID = TYPEDEF('LPVOID', PTR(VOID)),
 LPCVOID = TYPEDEF('LPCVOID', PTR(VOID)),
 INT = TYPEDEF('INT', int),
 UINT = TYPEDEF('UINT', uint),
 PUINT = TYPEDEF('PUINT', PTR(uint)),
 UINT16 = TYPEDEF('UINT16', ushort),
 UINT32 = TYPEDEF('UINT32', uint),
 UINT64 = TYPEDEF('UINT64', ulonglong),
 INT_PTR = TYPEDEF('INT_PTR', int),
 UINT_PTR = TYPEDEF('UINT_PTR', uint),
 PUINT_PTR = TYPEDEF('PUINT_PTR', PTR(uint)),
 LONG_PTR = TYPEDEF('LONG_PTR', long),
 ULONG_PTR = TYPEDEF('ULONG_PTR', ulong),
 PULONG_PTR = TYPEDEF('PULONG_PTR', PTR(ulong)),
 SIZE_T = TYPEDEF('SIZE_T', ulong),
 PSIZE_T = TYPEDEF('PSIZE_T', PTR(ulong)),
 DWORD_PTR = TYPEDEF('DWORD_PTR', ulong),
 PDWORD_PTR = TYPEDEF('PDWORD_PTR', PTR(ulong)),
 LONG64 = TYPEDEF('LONG64', longlong),
 ULONG64 = TYPEDEF('ULONG64', ulonglong),
 PULONG64 = TYPEDEF('PULONG64', PTR(ulonglong)),
 DWORD64 = TYPEDEF('DWORD64', ulonglong),
 KAFFINITY = TYPEDEF('KAFFINITY', ulong),
 PVOID = TYPEDEF('PVOID', PTR(VOID)),
 PVOID64 = TYPEDEF('PVOID64', PTR(VOID)),
 CHAR = TYPEDEF('CHAR', int8),
 SHORT = TYPEDEF('SHORT', short),
 LONG = TYPEDEF('LONG', long),
 WCHAR = TYPEDEF('WCHAR', ushort),
 PWCHAR = TYPEDEF('PWCHAR', PTR(ushort)),
 LPWCH = TYPEDEF('LPWCH', PTR(ushort)),
 LPWSTR = TYPEDEF('LPWSTR', PTR(ushort)),
 PWSTR = TYPEDEF('PWSTR', PTR(ushort)),
 PUWSTR = TYPEDEF('PUWSTR', PTR(ushort)),
 LPCWSTR = TYPEDEF('LPCWSTR', PTR(ushort)),
 PCWSTR = TYPEDEF('PCWSTR', PTR(ushort)),
 PCUWSTR = TYPEDEF('PCUWSTR', PTR(ushort)),
 PZZWSTR = TYPEDEF('PZZWSTR', PTR(ushort)),
 PCZZWSTR = TYPEDEF('PCZZWSTR', PTR(ushort)),
 PCNZWCH = TYPEDEF('PCNZWCH', PTR(ushort)),
 LPCH = TYPEDEF('LPCH', PTR(int8)),
 LPCCH = TYPEDEF('LPCCH', PTR(int8)),
 LPSTR = TYPEDEF('LPSTR', PTR(int8)),
 PSTR = TYPEDEF('PSTR', PTR(int8)),
 LPCSTR = TYPEDEF('LPCSTR', PTR(int8)),
 PCNZCH = TYPEDEF('PCNZCH', PTR(int8)),
 PLONG = TYPEDEF('PLONG', PTR(long)),
 HANDLE = TYPEDEF('HANDLE', PTR(VOID)),
 HRESULT = TYPEDEF('HRESULT', long),
 CCHAR = TYPEDEF('CCHAR', int8),
 LCID = TYPEDEF('LCID', ulong),
 LANGID = TYPEDEF('LANGID', ushort),
 LONGLONG = TYPEDEF('LONGLONG', longlong),
 ULONGLONG = TYPEDEF('ULONGLONG', ulonglong),
 PULONGLONG = TYPEDEF('PULONGLONG', PTR(ulonglong)),
 USN = TYPEDEF('USN', longlong),
 DWORDLONG = TYPEDEF('DWORDLONG', ulonglong),
 BOOLEAN = TYPEDEF('BOOLEAN', uchar),
 PBOOLEAN = TYPEDEF('PBOOLEAN', PTR(uchar)),
 PACCESS_TOKEN = TYPEDEF('PACCESS_TOKEN', PTR(VOID)),
 PSECURITY_DESCRIPTOR = TYPEDEF('PSECURITY_DESCRIPTOR', PTR(VOID)),
 PSID = TYPEDEF('PSID', PTR(VOID)),
 ACCESS_MASK = TYPEDEF('ACCESS_MASK', ulong),
 PACCESS_MASK = TYPEDEF('PACCESS_MASK', PTR(ulong)),
 SID_HASH_ENTRY = TYPEDEF('SID_HASH_ENTRY', ulong),
 SECURITY_DESCRIPTOR_CONTROL = TYPEDEF('SECURITY_DESCRIPTOR_CONTROL', ushort),
 PSECURITY_DESCRIPTOR_CONTROL = TYPEDEF('PSECURITY_DESCRIPTOR_CONTROL', PTR(ushort)),
 ACCESS_REASON = TYPEDEF('ACCESS_REASON', ulong),
 SECURITY_CONTEXT_TRACKING_MODE = TYPEDEF('SECURITY_CONTEXT_TRACKING_MODE', uchar),
 SECURITY_INFORMATION = TYPEDEF('SECURITY_INFORMATION', ulong),
 PSECURITY_INFORMATION = TYPEDEF('PSECURITY_INFORMATION', PTR(ulong)),
 EXECUTION_STATE = TYPEDEF('EXECUTION_STATE', ulong),
 SAVEPOINT_ID = TYPEDEF('SAVEPOINT_ID', ulong),
 TP_VERSION = TYPEDEF('TP_VERSION', ulong),
 WPARAM = TYPEDEF('WPARAM', uint),
 LPARAM = TYPEDEF('LPARAM', long),
 LRESULT = TYPEDEF('LRESULT', long),
 ATOM = TYPEDEF('ATOM', ushort),
 HGLOBAL = TYPEDEF('HGLOBAL', PTR(VOID)),
 HLOCAL = TYPEDEF('HLOCAL', PTR(VOID)),
 HGDIOBJ = TYPEDEF('HGDIOBJ', PTR(VOID)),
 HFILE = TYPEDEF('HFILE', int),
 COLORREF = TYPEDEF('COLORREF', ulong),
 PUMS_CONTEXT = TYPEDEF('PUMS_CONTEXT', PTR(VOID)),
 PUMS_COMPLETION_LIST = TYPEDEF('PUMS_COMPLETION_LIST', PTR(VOID)),
 LCSCSTYPE = TYPEDEF('LCSCSTYPE', long),
 LCSGAMUTMATCH = TYPEDEF('LCSGAMUTMATCH', long),
 FXPT2DOT30 = TYPEDEF('FXPT2DOT30', long),
 COLOR16 = TYPEDEF('COLOR16', ushort),
 HDWP = TYPEDEF('HDWP', PTR(VOID)),
 HDEVNOTIFY = TYPEDEF('HDEVNOTIFY', PTR(VOID)),
 HPOWERNOTIFY = TYPEDEF('HPOWERNOTIFY', PTR(VOID)),
 LGRPID = TYPEDEF('LGRPID', ulong),
 LCTYPE = TYPEDEF('LCTYPE', ulong),
 CALTYPE = TYPEDEF('CALTYPE', ulong),
 CALID = TYPEDEF('CALID', ulong),
 NLS_FUNCTION = TYPEDEF('NLS_FUNCTION', ulong),
 GEOID = TYPEDEF('GEOID', long),
 GEOTYPE = TYPEDEF('GEOTYPE', ulong),
 GEOCLASS = TYPEDEF('GEOCLASS', ulong),
 REGSAM = TYPEDEF('REGSAM', ulong),
 LSTATUS = TYPEDEF('LSTATUS', long),
 MMVERSION = TYPEDEF('MMVERSION', uint),
 MMRESULT = TYPEDEF('MMRESULT', uint),
 LPUINT = TYPEDEF('LPUINT', PTR(uint)),
 FOURCC = TYPEDEF('FOURCC', ulong),
 HPSTR = TYPEDEF('HPSTR', PTR(int8)),
 MCIERROR = TYPEDEF('MCIERROR', ulong),
 MCIDEVICEID = TYPEDEF('MCIDEVICEID', uint),
 RPC_STATUS = TYPEDEF('RPC_STATUS', long),
 RPC_CSTR = TYPEDEF('RPC_CSTR', PTR(uchar)),
 RPC_WSTR = TYPEDEF('RPC_WSTR', PTR(ushort)),
 RPC_BINDING_HANDLE = TYPEDEF('RPC_BINDING_HANDLE', PTR(VOID)),
 handle_t = TYPEDEF('handle_t', PTR(VOID)),
 RPC_IF_HANDLE = TYPEDEF('RPC_IF_HANDLE', PTR(VOID)),
 RPC_AUTH_IDENTITY_HANDLE = TYPEDEF('RPC_AUTH_IDENTITY_HANDLE', PTR(VOID)),
 //RPC_ADDRESS_CHANGE_FN = TYPEDEF('RPC_ADDRESS_CHANGE_FN', CALLBACK(VOID, [PTR(VOID)])),
 I_RPC_MUTEX = TYPEDEF('I_RPC_MUTEX', PTR(VOID)),
 RPC_NS_HANDLE = TYPEDEF('RPC_NS_HANDLE', PTR(VOID)),
 FILEOP_FLAGS = TYPEDEF('FILEOP_FLAGS', ushort),
 u_short = TYPEDEF('u_short', ushort),
 u_int = TYPEDEF('u_int', uint),
 u_long = TYPEDEF('u_long', ulong),
 SOCKET = TYPEDEF('SOCKET', uint),
 ALG_ID = TYPEDEF('ALG_ID', uint),
 HCRYPTPROV = TYPEDEF('HCRYPTPROV', ulong),
 HCRYPTKEY = TYPEDEF('HCRYPTKEY', ulong),
 HCRYPTHASH = TYPEDEF('HCRYPTHASH', ulong),
 NTSTATUS = TYPEDEF('NTSTATUS', long),
 BCRYPT_HANDLE = TYPEDEF('BCRYPT_HANDLE', PTR(VOID)),
 BCRYPT_ALG_HANDLE = TYPEDEF('BCRYPT_ALG_HANDLE', PTR(VOID)),
 BCRYPT_KEY_HANDLE = TYPEDEF('BCRYPT_KEY_HANDLE', PTR(VOID)),
 BCRYPT_HASH_HANDLE = TYPEDEF('BCRYPT_HASH_HANDLE', PTR(VOID)),
 BCRYPT_SECRET_HANDLE = TYPEDEF('BCRYPT_SECRET_HANDLE', PTR(VOID)),
 SECURITY_STATUS = TYPEDEF('SECURITY_STATUS', long),
 NCRYPT_HANDLE = TYPEDEF('NCRYPT_HANDLE', ulong),
 NCRYPT_PROV_HANDLE = TYPEDEF('NCRYPT_PROV_HANDLE', ulong),
 NCRYPT_KEY_HANDLE = TYPEDEF('NCRYPT_KEY_HANDLE', ulong),
 NCRYPT_SECRET_HANDLE = TYPEDEF('NCRYPT_SECRET_HANDLE', ulong),
 HCRYPTPROV_OR_NCRYPT_KEY_HANDLE = TYPEDEF('HCRYPTPROV_OR_NCRYPT_KEY_HANDLE', ulong),
 HCRYPTPROV_LEGACY = TYPEDEF('HCRYPTPROV_LEGACY', ulong),
 HCRYPTOIDFUNCSET = TYPEDEF('HCRYPTOIDFUNCSET', PTR(VOID)),
 HCRYPTOIDFUNCADDR = TYPEDEF('HCRYPTOIDFUNCADDR', PTR(VOID)),
 HCRYPTMSG = TYPEDEF('HCRYPTMSG', PTR(VOID)),
 HCERTSTORE = TYPEDEF('HCERTSTORE', PTR(VOID)),
 HCERTSTOREPROV = TYPEDEF('HCERTSTOREPROV', PTR(VOID)),
 HCRYPTDEFAULTCONTEXT = TYPEDEF('HCRYPTDEFAULTCONTEXT', PTR(VOID)),
 HCRYPTASYNC = TYPEDEF('HCRYPTASYNC', PTR(VOID)),
 HCERTCHAINENGINE = TYPEDEF('HCERTCHAINENGINE', PTR(VOID)),
 HCERT_SERVER_OCSP_RESPONSE = TYPEDEF('HCERT_SERVER_OCSP_RESPONSE', PTR(VOID)),
 byte = TYPEDEF('byte', uchar),
 NDR_CCONTEXT = TYPEDEF('NDR_CCONTEXT', PTR(VOID)),
 PFORMAT_STRING = TYPEDEF('PFORMAT_STRING', PTR(uchar)),
 RPC_SS_THREAD_HANDLE = TYPEDEF('RPC_SS_THREAD_HANDLE', PTR(VOID)),
 OLECHAR = TYPEDEF('OLECHAR', ushort),
 LPOLESTR = TYPEDEF('LPOLESTR', PTR(ushort)),
 LPCOLESTR = TYPEDEF('LPCOLESTR', PTR(ushort)),
 DOUBLE = TYPEDEF('DOUBLE', double),
 SCODE = TYPEDEF('SCODE', long),
 CLIPFORMAT = TYPEDEF('CLIPFORMAT', ushort),
 HMETAFILEPICT = TYPEDEF('HMETAFILEPICT', PTR(VOID)),
 DATE = TYPEDEF('DATE', double),
 BSTR = TYPEDEF('BSTR', PTR(ushort)),
 VARIANT_BOOL = TYPEDEF('VARIANT_BOOL', short),
 VARTYPE = TYPEDEF('VARTYPE', ushort),
 PROPID = TYPEDEF('PROPID', ulong),
 DEVICE_DATA_MANAGEMENT_SET_ACTION = TYPEDEF('DEVICE_DATA_MANAGEMENT_SET_ACTION', ulong),
 LPCBYTE = TYPEDEF('LPCBYTE', PTR(uchar)),
 SCARDCONTEXT = TYPEDEF('SCARDCONTEXT', ulong),
 LPSCARDCONTEXT = TYPEDEF('LPSCARDCONTEXT', PTR(ulong)),
 SCARDHANDLE = TYPEDEF('SCARDHANDLE', ulong),
 LPSCARDHANDLE = TYPEDEF('LPSCARDHANDLE', PTR(ulong)),
 RPCOLEDATAREP = TYPEDEF('RPCOLEDATAREP', ulong),
 HOLEMENU = TYPEDEF('HOLEMENU', PTR(VOID)),
 DISPID = TYPEDEF('DISPID', long),
 MEMBERID = TYPEDEF('MEMBERID', long),
 HREFTYPE = TYPEDEF('HREFTYPE', ulong),
 PROPVAR_PAD1 = TYPEDEF('PROPVAR_PAD1', ushort),
 PROPVAR_PAD2 = TYPEDEF('PROPVAR_PAD2', ushort),
 PROPVAR_PAD3 = TYPEDEF('PROPVAR_PAD3', ushort),
 SC_LOCK = TYPEDEF('SC_LOCK', PTR(VOID)),
 
 HWND = TYPEDEF('HWND', HANDLE),
 HHOOK = TYPEDEF('HHOOK', HANDLE),
 HKEY = TYPEDEF('HKEY', HANDLE),
 HACCEL = TYPEDEF('HACCEL', HANDLE),
 HBITMAP = TYPEDEF('HBITMAP', HANDLE),
 HBRUSH = TYPEDEF('HBRUSH', HANDLE),
 HCOLORSPACE = TYPEDEF('HCOLORSPACE', HANDLE),
 HDC = TYPEDEF('HDC', HANDLE),
 HGLRC = TYPEDEF('HGLRC', HANDLE),
 HDESK = TYPEDEF('HDESK', HANDLE),
 HENHMETAFILE = TYPEDEF('HENHMETAFILE', HANDLE),
 HFONT = TYPEDEF('HFONT', HANDLE),
 HICON = TYPEDEF('HICON', HANDLE),
 HMENU = TYPEDEF('HMENU', HANDLE),
 HMETAFILE = TYPEDEF('HMETAFILE', HANDLE),
 HINSTANCE = TYPEDEF('HINSTANCE', HANDLE),
 HPALETTE = TYPEDEF('HPALETTE', HANDLE),
 HPEN = TYPEDEF('HPEN', HANDLE),
 HRGN = TYPEDEF('HRGN', HANDLE),
 HRSRC = TYPEDEF('HRSRC', HANDLE),
 HSPRITE = TYPEDEF('HSPRITE', HANDLE),
 HLSURF = TYPEDEF('HLSURF', HANDLE),
 HSTR = TYPEDEF('HSTR', HANDLE),
 HTASK = TYPEDEF('HTASK', HANDLE),
 HWINSTA = TYPEDEF('HWINSTA', HANDLE),
 HKL = TYPEDEF('HKL', HANDLE),
 HWINEVENTHOOK = TYPEDEF('HWINEVENTHOOK', HANDLE),
 HMONITOR = TYPEDEF('HMONITOR', HANDLE),
 HUMPD = TYPEDEF('HUMPD', HANDLE),
 MARGINS = STRUCT('MARGINS', {
  cxLeftWidth:int,
  cxRightWidth:int,
  cyTopHeight:int,
  cyBottomHeight:int,
}),
COLORIZATIONPARAMS = STRUCT('COLORIZATIONPARAMS', {
  clrColor:COLORREF,
  clrAftGlow:COLORREF,
  nIntensity:UINT,
  clrAftGlowBal:UINT,
  clrBlurBal:UINT,
  clrGlassReflInt:UINT,
  fOpaque:BOOL
});


win32.user32 = new ffi.Library('user32.dll', {
  GetWindowLongA: [ LONG, [ HWND, int ] ],
  GetWindowLongW: [ LONG, [ HWND, int ] ],
  SetWindowLongA: [ LONG, [ HWND, int, LONG ] ],
  SetWindowLongW: [ LONG, [ HWND, int, LONG ] ],
  GetSystemMenu: [ HMENU, [HWND, BOOL ] ],
  EnableMenuItem: [ BOOL, [ HMENU, UINT, UINT ] ] /*,
  SetClassLongPtr: [ ULONG_PTR, [ HWND, int, LONG_PTR ] ],
  GetClassLongPtr: [ ULONG_PTR, [ HWND, int ] ]*/
});

win32.dwmapi = new ffi.Library('dwmapi.dll', {
  DwmExtendFrameIntoClientArea: [ HRESULT, [ HWND, MARGINS ] ],
  DwmSetColorizationParameters: [ HRESULT, [ COLORIZATIONPARAMS,  UINT ] ],
  DwmGetColorizationParameters: [ HRESULT, [ COLORIZATIONPARAMS ]]
});
win32.dwmapi.MARGINS = MARGINS;
win32.dwmapi.COLORIZATIONPARAMS = COLORIZATIONPARAMS;

win32.user32.GetWindowLong = win32.user32.GetWindowLongW;
win32.user32.SetWindowLong = win32.user32.SetWindowLongW;
win32.user32.WM_SYSCOMMAND = 0x0112;
win32.user32.WS_MAXIMIZEBOX = 0x10000;
win32.user32.WS_MINIMIZEBOX = 0x20000;
win32.user32.WS_SIZEBOX = 0x40000;
win32.user32.WS_THICKFRAME = win32.user32.WS_SIZEBOX;
win32.user32.WS_CAPTION = 0xC00000;
win32.user32.WS_EX_WINDOWEDGE = 0x00000100;
win32.user32.WS_SYSMENU = 0x80000;
win32.user32.GWL_STYLE = -16;
win32.user32.MF_BYCOMMAND = 0x00000000;
win32.user32.MF_BYPOSITION = 0x00000400;
win32.user32.MF_DISABLED = 0x00000002;
win32.user32.MF_ENABLED = 0x00000000;
win32.user32.MF_GRAYED = 0x00000001;

win32.user32.SC_CLOSE = 0xF060;
win32.user32.SC_CONTEXTHELP = 0xF180;
win32.user32.SC_DEFAULT = 0xF160;
win32.user32.SC_HOTKEY = 0xF150;
win32.user32.SC_HSCROLL = 0xF080;
win32.user32.SC_KEYMENU = 0xF100;
win32.user32.SC_MAXIMIZE = 0xF030;
win32.user32.SC_MINIMIZE = 0xF020;

win32.user32.GCLP_HBRBACKGROUND = -10;


