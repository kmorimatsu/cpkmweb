/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

// Initialize Z80 CPU
var speed=2000000; // 2 Mhz
var maxspeed=speed;
z80.setSpeed(speed);
z80.reset();
z80.events=function(){
	// z80.events() will be called every msec.
}
// Override JP command for loading from/saving to file.
var autostart=get.start;
z80.codeC3copy=z80.codeC3;
/*
; Environ specific codes jump table
romCONST:  JP 0x0000 ;0xf233
romCONIN:  JP 0x0000 ;0xf236
romCONOUT: JP 0x0000 ;0xf239
romREAD:   JP 0x0000 ;0xf23c
romWRITE:  JP 0x0000 ;0xf23f
*/
z80.codeC3=function(){
	if (this.regPC<0xD234 || 0xD240<this.regPC) return this.codeC3copy();
	switch(this.regPC){
		case 0xd234:
			//0C-0F CONST (console status; Returns its status in A; 0 if no character is ready, 0FFh if one is.)
			if (i8255.const()) {
				z80.loadA(0xff);
			} else {
				z80.loadA(0x00);
			}
			break;
		case 0xd237:
			//14-17 CONIN (console in; Wait until the keyboard is ready to provide a character, and return it in A.)
			if (i8255.const()) {
				// There is key-in.
				z80.loadA(i8255.conin());
			} else {
				// There isn't key-in. Execute the jump command (infinite loop).
				return this.codeC3copy();
			}
			break;
		case 0xd23a:
			//1C-1F CONOUT (console out; Write the character in C to the screen.)
			display.writeChar(z80.regC);
			break;
		case 0xd23d:
			// READ
			disk.read(z80.regHL);
			z80.loadA(0x00);
			break;
		case 0xd240:
			// WRITE
			disk.write(z80.regHL);
			z80.loadA(0x00);
			break;
		default:
			return this.codeC3copy();
	}
	z80.codeC9();
}
// Initialize Memory
memory.init();
// Initialize ROM
memory.initrom();
// Additional initializations
if (typeof mztape !="undefined") mztape.load();
if (get.debug && typeof debugDisplay !="undefined") {
	dom.showDebug();
	if (get.break) {
		z80.breakPoint=parseInt(get.break,16);
	}
}
// Following function will be called by initializing display.
start=function(){
	var time;
	time=new Date().getTime();
	setTimeout(function(){
			var from=time;
			var to=time=new Date().getTime();
			var msec=to-from;
			if (msec<50 && speed<maxspeed) {
				speed<<=1;
				 if (15625<speed && speed<31250) speed=15625;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			} else if (100<msec) {
				speed>>=1;
				if (speed<1) speed=1;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			}
			z80.exec(msec);
			if (z80.step) {
				showRegisters();
			} else {
				setTimeout(arguments.callee,10);
			}
		},10);
};

