/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	disk.read(pos);
	disk.write(pos);
	disk.update(data);
	disk.saveLink(obj);
*/

disk=new Object();
disk.read=function(pos){
	pos*=128;
	for(var i=0;i<128;i++){
		memory.ram[0xff80+i]=this.cpmdisks[pos+i];
	}
};
disk.write=function(pos){
	pos*=128;
	for(var i=0;i<128;i++){
		this.cpmdisks[pos+i]=memory.ram[0xff80+i];
	}
};
disk.cpmdisks=Array(128*64*244*4);
disk.update=function(data){
	for(var i=0;i<data.length;i++) {
		this.cpmdisks[i]=data[i];
	}
};
disk.saveLink=function(obj){
	// Construct ZIP archive containing "cpmdisks"
	var zip = new JSZip();
	zip.file("cpmdisks",this.cpmdisks);
	var data="data:application/zip;base64,";
	data+=zip.generate({type:"base64",compression: "DEFLATE"});
	// Update href property of a tag
	obj.href=data;
	obj.click();
};
disk.init=function(){
	for(var i=0;i<128*64*244*4;i++) {
		this.cpmdisks[i]=0x00;
	}
	// Construct fake CPM copy 
	var re=/:([0-9A-F]{2})([0-9A-F]{4})([0-9A-F]{2})([0-9A-F]*)([0-9A-F]{2})/i;
	var ihxdata=this.diskdata.split("\n");
	for(var i=0;i<ihxdata.length;i++){
		var m=ihxdata[i].match(re);
		// If not ":.....", skip
		if (!m) continue;
		// Fetch data from each line.
		var bytes=parseInt(m[1],16);
		var addr=parseInt(m[2],16);
		var mode=parseInt(m[3],16);
		var csum=parseInt(m[5],16);
		// If mode is not "00" skip
		if (mode!=0) continue;
		// Pick up all byte data and write to memory
		for(var j=0;j<bytes;j++){
			var b=parseInt(m[4].substr(j*2,2),16);
			this.cpmdisks[addr+j-0xdc00]=b;
		}
		// Checksum is ignored.
	}
};
disk.diskdata=(function(){/*
:0EDC0000F33100DC2115DC0E0ACD0CF24E23B0
:0EDC0E00AFB920F77618EB0A0A546F20737432
:0EDC1C006172742043502F4D20322E322C2086
:0EDC2A00612076616C6964206469736B206907
:0EDC38006D61676520636F6E7461696E696E61
:0EDC4600672043504D2E5359532069732072AE
:0EDC54006575697265642E0A546F206F6274E4
:0EDC620061696E20746865206469736B2069C7
:0EDC70006D6167652C20676F20746F3A0A683B
:0EDC7E007474703A2F2F7777772E7265636675
:0EDC8C006F722E6E65742F70726F6A6563740E
:08DC9A00732F63706D2F0A0067
:00000001FF
*/}).toString().match(/\/\*([\s\S]*)\*\//)[1];
disk.init();
/*
; This is fake CP/M system file.
; To obtain valid disk image file containing CP/M (ver 2.2), go to:
; http://www.recfor.net/projects/cpm/
; 
; This file can be assembled by SDCC:
; sdasz80 -o %1
; sdcc *.rel -mz80 --code-loc 0xdc00 --data-loc 0xfc00 --no-std-crt0

CONOUT       =0xf20c

.area _CODE

startAddress:
	di
	ld sp,#startAddress
	ld hl,#infoString

	ld c,#0x0a
loop:
	call CONOUT
	ld c,(hl)
	inc hl
	xor a
	cp c
	jr nz,loop

	halt
	jr startAddress

infoString:
	.db 0x0a
	.db 0x0a
	.ascii "To start CP/M 2.2, a valid disk image containing CPM.SYS is reuired."
	.db 0x0a
	.ascii "To obtain the disk image, go to:"
	.db 0x0a
	.ascii "http://www.recfor.net/projects/cpm/"
	.db 0x0a
	.db 0
*/
