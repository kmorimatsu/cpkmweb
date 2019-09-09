/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	memory.read(addr);
	memory.write(addr,data);
	memory.init();
	memory.load();
*/
memory=new Object();
memory.ram=Array(0x10000); // 64 KB RAM
memory.userom=true;
memory.useram=function(use){
	memory.userom=use ? false:true;
};
memory.init=function(){
	// All 64 kbytes are assigned to RAM
	var i;
	for (i=0;i<0x10000;i++) {
		this.ram[i]=0;
	}
};
memory.read=function(addr){
	addr&=0xffff;
	if (this.userom && addr<0x8000){
		// ROM
		return this.rom[addr];
	} else {
		// RAM
		return this.ram[addr];
	}
};
memory.write=function(addr,data){
	addr&=0xffff;
	data&=0xff;
	if (this.userom && addr<0x8000){
		// ROM
	} else {
		// RAM
		this.ram[addr]=data;
	}
};
memory.load=function(data){
	var i;
	// Copy data to RAM from 0x0100
	for(i=0;i<data.length;i++){
		this.ram[0x0100+i]=data[i];
	}
	// File length must be 128 byte blocks.
	// Fill 0x00 at the end if required.
	for(;i<128*parseInt((data.length+127)/128);i++){
		this.ram[0x0100+i]=0x00;
	}
}
