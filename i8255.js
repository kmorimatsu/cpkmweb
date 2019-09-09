/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	i8255.read(addr);
	i8255.write(addr,data);
	i8255.keyup(key);
	i8255.keydown(key);
	i8255.conin();
	i8255.const();
*/
/*
	Port A: all input
	A0: Serial in (not used by this emulator)
	A4: Read from SD card  (not used by this emulator)
	
	Port B: not used
	Port C: all output
	C0: Serial out (not used by this emulator)
	C1: RAM/ROM (0: RAM, 1: ROM)
	C4: Data to SD card (not used by this emulator)
	C5: Clock to SD card (not used by this emulator)
	C6: CS to SD card (not used by this emulator)
*/
i8255=new Object();
i8255.keypress=0;
i8255.portC=0;
i8255.command='';
i8255.setCommand=function(str){
	this.command=str;
};
i8255.reset=function(){
	this.portCw(0xff);
};
i8255.read=function(addr){
	addr&=0x0003;
	switch (addr) {
		case 0: // PORT A
			return 0xff;
		case 1: // PORT B
			return 0xff;
		case 2: // PORT C
			return 0xff;
		default:
			return 0xff;
	}
};
i8255.write=function(addr,data){
	addr&=0x0003;
	data&=0xff;
	switch (addr) {
		case 0: // PORT A
			return;
		case 1: // PORT B
			return;
		case 2: // PORT C
			this.portCw(data);
			return;
		default:
			// portC-controling code will be here
			if (data&0x80) return; // Ignore configuration
			if (data&0x01) {
				// set bit
				data&=0x0e;
				data>>=1;
				data=1<<data;
				data|=this.portC;
				this.portCw(data);
			} else {
				// clear bit
				data&=0x0e;
				data>>=1;
				data=1<<data;
				data^=0xff;
				data&=this.portC;
				this.portCw(data);
			}
			return;
	}
};
i8255.portCw=function(data){
	// Only C1 is used in this emulator.
	// C1: RAM/ROM (0: RAM, 1: ROM)
	memory.userom = (data & 2) ? true:false;
};
i8255.keydown=function(key,shift,ctrl){
	if (64<key && key<91) {
		// A-Z
		if (ctrl) {
			this.keypress=key-64;
		} else {
			this.keypress=key+(shift ? 0:32);
		}
	} else if (0x30<=key && key<=0x39 && shift) {
		// Shift + 0-9
		this.keypress=")!@#$%^&*(".charCodeAt(key-0x30);
	} else if (key==0x10 || key==0x11 || key==0x14) {
		// Shift, Ctrl, and Caps-Lock key
	} else if (shift) {
		switch(key) {
			case 173: //_
				this.keypress="_".charCodeAt(0);
				break;
			case 61:  //+
				this.keypress="+".charCodeAt(0);
				break;
			case 219: //{
				this.keypress="{".charCodeAt(0);
				break;
			case 221: //}
				this.keypress="}".charCodeAt(0);
				break;
			case 220: //|
				this.keypress="|".charCodeAt(0);
				break;
			case 59:  //:
				this.keypress=":".charCodeAt(0);
				break;
			case 222: //"
				this.keypress='"'.charCodeAt(0);
				break;
			case 188: //<
				this.keypress="<".charCodeAt(0);
				break;
			case 190: //>
				this.keypress=">".charCodeAt(0);
				break;
			case 191: //?
				this.keypress="?".charCodeAt(0);
				break;
			case 192: //~
				this.keypress="~".charCodeAt(0);
				break;
			default:
				this.keypress=key;
				break;
		}
	} else {//alert(key);
		switch(key) {
			case 222: //'
				this.keypress="'".charCodeAt(0);
				break;
			case 188: //,
				this.keypress=",".charCodeAt(0);
				break;
			case 190: //.
				this.keypress=".".charCodeAt(0);
				break;
			case 191: ///
				this.keypress="/".charCodeAt(0);
				break;
			case 192: //`
				this.keypress="`".charCodeAt(0);
				break;
			default:
				this.keypress=key;
				break;
		}
	}
}
i8255.keyup=function(key,shift,ctrl){

};
i8255.const=function(){
	var ret;
	if (this.command.length) {
		ret=this.command.charCodeAt(0);
	} else {
		ret=this.keypress;
	}
	return ret;
};
i8255.conin=function(){
	var ret;
	if (this.command.length) {
		ret=this.command.charCodeAt(0);
		this.command=this.command.substr(1);
	} else {
		ret=this.keypress;
		this.keypress=0;
	}
	return ret;
};
