//var fs = require('fs');
//var logfile = __filename + '.log';
//var fd = fs.openSync(logfile, 'w');
/**
 * @unit-test-setup
 * @ignore
 */
function setup() {
  require('Common');
  //fs.closeSync(2);
}

function baseline() {
}

/**
 * @see {Dialog}
 * @example
 */
function run($utils) {
  application.exitAfterWindowsClose = false;
  var ismac = (require('os').platform().toLowerCase() === "darwin" || require('os').platform().toLowerCase() === "mac");
  var win = new Window();
  win.visible = true;
  win.x = 0;
  win.y = 0;
  win.bringToFront();
  var dialog = new FileDialog("open");
  dialog.title = "Dialog Title";
  dialog.message = "Message dialog";
  dialog.prompt = "PROMPT";
  dialog.allowMultiple = true;
  dialog.directory = "~/Pictures";
  dialog.allowFileTypes = ["jpg","png"];
  dialog.filename = "somefile.png";
  dialog.addEventListener('select', function() {
    console.log('selected values: ',dialog.selection);
  });
  dialog.addEventListener('cancel', function() {
    /* @hidden */ win.destroy();
    /* @hidden */ $utils.ok();
  });
  //TODO: Figure out a way to test the blocking "open" function
  /* @hidden */ if(ismac) 
  dialog.open(win);
  /* @hidden */ $utils.assert(dialog.title === "Dialog Title", 'Expected "Dialog Title" got "' + dialog.title + '"');
  /* @hidden */ $utils.assert(dialog.message === "Message dialog", 'Expected "Message dialog" === ' + dialog.message);
  /* @hidden */ $utils.assert(dialog.prompt === "PROMPT", 'expected PROMPT got '+dialog.prompt);
  /* @hidden */ $utils.assert(dialog.allowMultiple === true)
  /* @hidden */ //$utils.assert(dialog.directory === "file:///Users/tlinton/Pictures/",dialog.directory);
  /* @hidden */ $utils.assert(dialog.filename === "somefile.png", 'expected: "somefile.png" got: ' + dialog.filename);
  /* @hidden */ $utils.assert(dialog.type === "open");
  /* @hidden */ setTimeout(function() {
  /* @hidden */   dialog.cancel();
  /* @hidden */ },2000);
}

/**
 * @unit-test-shutdown
 * @ignore
 */
function shutdown() {
  //fs.closeSync(fd);
  //var log = fs.readFileSync(logfile, 'utf8');
  //fs.unlinkSync(logfile);
}

module.exports = {
  setup:setup, 
  run:run, 
  shutdown:shutdown, 
  shell:false,
  name:"FileDialog"
};