/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	display.init();
	display.write(addr,data);
	display(green);
*/

display=new Object();
display.fonts=new Image();
display.font=Array(256);
display.vram=Array(80*24);
display.init=function(){
	// Set the contexts.
	this.context=dom.getContext("display");
	// Load the font data. See also fonts.onload event.
	this.fonts.src="./font6x16.png?"+ new Date().getTime();
};
display.fonts.onload=function(){
	display.onload();
}
// display.onload will be called after sucessfull loading of font PNG image.
display.onload=function(){
	var h8,l8,i;
	// Show the PNG image
	this.context.drawImage(display.fonts,0,0);
	// Construction of images for font
	for (h8=0;h8<16;h8++) {
		for (l8=0;l8<16;l8++) {
			this.font[h8*16+l8]=this.context.getImageData(l8*6,h8*16,6,16);
		}
	}
	// Clear display
	this.cls();
	// Start blinking
	this.blink();
	// All done let's start Z80
	start();
};
display.cache=Array(4096);
display.readPos=0;
display.writePos=0;
display.cursor=0;
display.cls=function(){
	for(var i=0;i<80*24;i++){
		this.vram[i]=0x20;
	}
	this.cursor=0;
	this.all();
}
display.all=function(){
	var data,posy,posx;
	this.readPos=this.writePos;
	for (posy=0;posy<24;posy++) {
		for (posx=0;posx<80;posx++) {
			data=this.vram[posy*80+posx];
			this.context.putImageData(this.font[data],posx*6,posy*16);
		}
	}
};
display.refresh=function(){
	var data,posy,posx;
	var num=this.readPos-this.writePos;
	while (num<0) num+=4096;
	if (1000<num) {
		display.all();
		return;
	}
	while (this.readPos!=this.writePos) {
		this.readPos=(this.readPos+1)&0xfff;
		data=this.cache[this.readPos];
		posx=data[0] & 0x3ff;
		data=data[1] & 0xff;
		posy=0;
		if (2000<=posx) return;
		while(80<=posx) {
			posy++;
			posx-=80;
		}
		this.context.putImageData(this.font[data],posx*6,posy*16);
	}
};
display.write=function(addr,data){
	if (this.readPos==this.writePos) {
		setTimeout(function(){ display.refresh();},1);
	}
	var pos=(this.writePos+1)&0xfff;
	this.cache[pos]=[addr,data];
	this.writePos=pos;
	this.vram[addr]=data;
};
display.prevascii=0;
display.writeChar=function(ascii){
	this.write(this.cursor,this.blinkchar);
	switch(ascii){
		case 0x00: // null
		case 0x02: // ^B
		case 0x03: // ^C
		case 0x04: // ^D
		case 0x05: // ^E
		case 0x0c: // ^L
		case 0x0e: // ^N
		case 0x0f: // ^O
		case 0x10: // ^P
		case 0x11: // ^Q
		case 0x12: // ^R
		case 0x13: // ^S
		case 0x14: // ^T
		case 0x15: // ^U
		case 0x16: // ^V
		case 0x17: // ^W
		case 0x19: // ^Y
			break;
		case 0x01: // ^A
			this.cursor--;
			if (this.cursor<0) this.cursor=0;
			break;
		case 0x06: // ^F
			this.cursor++;
			if (80*24<=this.cursor) this.cursor=80*24-1;
			break;
		case 0x07: // ^G
			this.write(this.cursor,0x20);
			break;
		case 0x09: // ^I (TAB)
			if ((this.cursor%80)<70) {
				this.cursor+=10-(this.cursor%10);
			}
			break;
		case 0x08: // ^H (BS)
			this.cursor--;
			if (this.cursor<0) this.cursor=0;
			this.write(this.cursor,0x20);
			break;
		case 0x0a: // (^J) LF
			if (this.prevascii==0x0d) break; // Ignore if the previous ascii code is CR (0x0d).
			this.cursor=parseInt(this.cursor/80)*80+80;
			break;
		case 0x0b: // ^K
			/*for(var i=this.cursor;i<parseInt(this.cursor/80)*80+80;i++){
				this.write(i,0x20);
			}*/
			if (80<=this.cursor) this.cursor-=80;
			break;
		case 0x0d: // ^M (CR)
			this.cursor=parseInt(this.cursor/80)*80+80;
			break;
		case 0x18: // ^X
			for(var i=i<parseInt(this.cursor/80)*80;i<this.cursor;i++){
				this.write(i,0x20);
			}
			this.cursor=parseInt(this.cursor/80)*80;
			break;
		case 0x7f: // DEL
			break;
		case 0x1a: // ^Z
			this.cls();
			break;
		case 0x1c: // ^\
			this.cursor++;
			break;
		case 0x1d: // ^]
			if (0<this.cursor) this.cursor--;
			break;
		case 0x1e: // ^^
			this.cursor=0;
			break;
		default:
			this.write(this.cursor,ascii);
			this.cursor++;
			break;
	}
	// Check if scroll up is needed.
	if ((80*24-1)<this.cursor) {
		var i;
		// Scroll up
		for(i=0;i<80*(24-1);i++){
			this.vram[i]=this.vram[i+80];
		}
		// Clear the last line.
		for(i=80*(24-1);i<(80*24);i++){
			this.vram[i]=0x20;
		}
		display.refresh();
		// Set the cursor position to lower left.
		this.cursor=80*(24-1);
	}
	this.prevascii=ascii;
	this.blinkchar=this.vram[this.cursor];
	this.blink();
};
display.blinkchar=0x20;
display.blink=function(){
	try {
		clearTimeout(this.blinkid);
	} catch(e) {}
	this.blinkid=setTimeout(function(){ display.blink(); },500);
	if (this.vram[this.cursor]==0x7f) {
		this.write(this.cursor,this.blinkchar);
	} else {
		this.write(this.cursor,0x7f);
	}
};

