/**********************************
* Z80 emulator written by Katsumi *
*           ver 0.80              * 
*     This script is released     *
*       under the LGPL v2.1.      *
**********************************/

/*
	Additional methods used for emulating Z80 CPU
*/

/* Junp Relative */
z80.z80JR=function(){
	var x8=this.getCode();
	if (x8&0x80) {
		this.loadPC(this.regPC+(0xFF00 | x8));
	} else {
		this.loadPC(this.regPC+x8);
	}
}

/*	Flag-setting routines follow
	Flag register: SZ-H-PNC
*/
z80.setSflag=function(){
	this.loadF(this.regF|0x80);
}
z80.clearSflag=function(){
	this.loadF(this.regF&0x7f);
}
z80.setZflag=function(){
	this.loadF(this.regF|0x40);
}
z80.clearZflag=function(){
	this.loadF(this.regF&0xbf);
}
z80.setHflag=function(){
	this.loadF(this.regF|0x10);
}
z80.clearHflag=function(){
	this.loadF(this.regF&0xef);
}
z80.setPflag=function(){
	this.loadF(this.regF|0x04);
}
z80.clearPflag=function(){
	this.loadF(this.regF&0xfb);
}
z80.setNflag=function(){
	this.loadF(this.regF|0x02);
}
z80.clearNflag=function(){
	this.loadF(this.regF&0xfd);
}
z80.setCflag=function(){
	this.loadF(this.regF|0x01);
}
z80.clearCflag=function(){
	this.loadF(this.regF&0xfe);
}

/*	Flag-setting functions for 8 bit increment.
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is set if carry from bit 3; reset otherwise
	P/V is set if r was 7FH before operation; reset otherwise
	N is reset
	C is not affected
*/
z80.flag8inc=function(x){
	this.loadF(
		(((x)&0x80) ? 0x80 : 0x00) |
		(((x)&0xFF) ? 0x00 : 0x40) |
		((((x)&0x0F)==0x00) ? 0x10 : 0x00) |
		(((x)==0x80) ? 0x04 : 0x00) |
		(this.flagC ? 0x01 : 0x00)
	);
}


/*	Flag-setting function for 8 bit decrement
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is set if borrow from bit 4, reset otherwise
	P/V is set if m was 80H before operation; reset otherwise
	N is set
	C is not affected
*/
z80.flag8dec=function(x){
	this.loadF(
		(((x)&0x80) ? 0x80 : 0x00) |
		(((x)&0xFF) ? 0x00 : 0x40) |
		((((x)&0x0F)==0x0F) ? 0x10 : 0x00) |
		(((x)==0x7F) ? 0x04 : 0x00) |
		0x02 |
		(this.flagC ? 0x01 : 0x00)
	);
}

/*	Set parity flag function uses a temporaly 8 bit register.
	This macro takes 21 cycles.
*/
z80.setZ80Parity=function(x){
	var y8=x;
	y8=y8^(y8>>4);
	y8=y8^(y8>>2);
	y8=y8^(y8>>1);
	if (y8&0x01) this.clearPflag();
	else this.setPflag();
}

/*	ADD and ADC instructions
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is set if carry from bit 3; reset otherwise
	P/V is set if overflow; reset otherwise
	N is reset
	C is set if carry from bit 7; reset otherwise
*/
z80.z80ADD=function(i8){
	var j8;
	var i16;
	var p;
	// Preparation
	i16=i8&0xff;
	j8=i8&0x7F;
	i8=i8&0x0F;
	// Prepare P flag
	p=(this.regA&0x80)?(this.regA-256):(this.regA);
	p+=(i16&0x80)?(i16-256):(i16);
	// Calculation
	i8=(this.regA&0x0F)+i8;
	j8=(this.regA&0x7F)+j8;
	i16=this.regA+i16;
	// Load A
	this.loadA(i16);
	// Set flags
	i8=i8&0x10;                // H flag
	i8|=i16&0x80;              // S flag
	if (!(i16&0xFF)) i8|=0x40; // Z flag
	if (p<-128 || 127<p)
	                 i8|=0x04; // P flag
	if (i16&0x100)   i8|=0x01; // C flag
	this.loadF(i8);
}
z80.z80ADC=function(i8){
	var j8;
	var i16;
	var p;
	// Preparation
	i16=i8&0xff;
	j8=i8&0x7F;
	i8=i8&0x0F;
	// Prepare P flag
	p=(this.regA&0x80)?(this.regA-256):(this.regA);
	p+=(i16&0x80)?(i16-256):(i16);
	// Calculation
	i8=(this.regA&0x0F)+i8;
	j8=(this.regA&0x7F)+j8;
	i16=this.regA+i16;
	if (this.flagC) {
		i8++;
		j8++;
		i16++;
		p++;
	}
	// Load A
	this.loadA(i16);
	// Set flags
	i8=i8&0x10;                // H flag
	i8|=i16&0x80;              // S flag
	if (!(i16&0xFF)) i8|=0x40; // Z flag
	if (p<-128 || 127<p)
	                 i8|=0x04; // P flag
	if (i16&0x100)   i8|=0x01; // C flag
	this.loadF(i8);
}

/*	SUB, CP and SBC insgtructions
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is set if borrow from bit 4; reset otherwise
	P/V is set if overflow; reset otherwise
	N is set
	C is set if borrow; reset otherwise
*/
z80.z80SUB=function(i8){
	var j8;
	var i16;
	var p;
	// Preparation
	i16=i8&0xff;
	j8=i8&0x7F;
	i8=i8&0x0F;
	// Prepare P flag
	p=(this.regA&0x80)?(this.regA-256):(this.regA);
	p-=(i16&0x80)?(i16-256):(i16);
	// Calculation
	i8=(this.regA&0x0F)-i8;
	j8=(this.regA&0x7F)-j8;
	i16=256+this.regA-i16;
	// Load A
	this.loadA(i16);
	// Set flags
	i8=i8&0x10;                // H flag
	i8|=i16&0x80;              // S flag
	if (!(i16&0xFF)) i8|=0x40; // Z flag
	if (p<-128 || 127<p)
	                 i8|=0x04; // P flag
	if (!(i16&0x100)) i8|=0x01;// C flag
	i8|=0x02;                  // N flag
	this.loadF(i8);
}
z80.z80CP=function(i8){
	var j8;
	var i16;
	var p;
	// Preparation
	i16=i8&0xff;
	j8=i8&0x7F;
	i8=i8&0x0F;
	// Prepare P flag
	p=(this.regA&0x80)?(this.regA-256):(this.regA);
	p-=(i16&0x80)?(i16-256):(i16);
	// Calculation
	i8=(this.regA&0x0F)-i8;
	j8=(this.regA&0x7F)-j8;
	i16=256+this.regA-i16;
	// Load A
	// Set flags
	i8=i8&0x10;                // H flag
	i8|=i16&0x80;              // S flag
	if (!(i16&0xFF)) i8|=0x40; // Z flag
	if (p<-128 || 127<p)
	                 i8|=0x04; // P flag
	if (!(i16&0x100)) i8|=0x01;// C flag
	i8|=0x02;                  // N flag
	this.loadF(i8);
}
z80.z80SBC=function(i8){
	var j8;
	var i16;
	var p;
	// Preparation
	i16=i8&0xff;
	j8=i8&0x7F;
	i8=i8&0x0F;
	// Prepare P flag
	p=(this.regA&0x80)?(this.regA-256):(this.regA);
	p-=(i16&0x80)?(i16-256):(i16);
	// Calculation
	i8=(this.regA&0x0F)-i8;
	j8=(this.regA&0x7F)-j8;
	i16=256+this.regA-i16;
	if (this.flagC) {
		i8--;
		j8--;
		i16--;
		p--;
	}
	// Load A
	this.loadA(i16);
	// Set flags
	i8=i8&0x10;                // H flag
	i8|=i16&0x80;              // S flag
	if (!(i16&0xFF)) i8|=0x40; // Z flag
	if (p<-128 || 127<p)
	                 i8|=0x04; // P flag
	if (!(i16&0x100)) i8|=0x01;// C flag
	i8|=0x02;                  // N flag
	this.loadF(i8);
}

/*	AND instruction
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is set
	P/V is reset if overflow; reset otherwise (no, should be parity)
	N is reset
	C is reset
*/
z80.z80AND=function(i8){
	var j8;
	i8&=this.regA;
	j8=i8&0x80;        // S flag
	if (!i8) j8|=0x40; // Z flag
	j8|=0x10;          // H flag
	this.loadA(i8);
	this.loadF(j8);
	this.setZ80Parity(i8); // P flag
}

/*	OR instruction
	Flag register: SZ-H-PNC
	S is set if result is negative; reset otherwise
	Z is set if result is zero; reset otherwise
	H is reset
	P/V is set if overflow; reset otherwise  (no, should be parity)
	N is reset
	C is reset
*/
z80.z80OR=function(i8){
	var j8;
	i8|=this.regA;
	j8=i8&0x80;        // S flag
	if (!i8) j8|=0x40; // Z flag
	this.loadA(i8);
	this.loadF(j8);
	this.setZ80Parity(i8); // P flag
}

/*	XOR instruction
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity even; reset otherwise
N is reset
C is reset
*/
z80.z80XOR=function(i8){
	var j8;
	i8^=this.regA;
	j8=i8&0x80;          // S flag
	if (!i8) j8|=0x40;   // Z flag
	this.loadA(i8);
	this.loadF(j8);
	this.setZ80Parity(i8); // P flag
}

/* RLC instuction: CY <- r7<-r0 <- r7
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity even; reset otherwise
N is reset
C is data from bit 7 of source register
*/
z80.z80RLC=function(i8){
	i8&=0xff;
	if (0x80&i8) {
		i8=i8<<1;
		i8|=0x01;
		this.setCflag();
	} else {
		i8=i8<<1;
		i8&=0xFE;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* RRC instuction: r0 -> r7->r0 -> CY
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity even; reset otherwise,
N is reset
C is data from bit 0 of source register
*/
z80.z80RRC=function(i8){
	i8&=0xff;
	if (0x01&i8) {
		i8=i8>>1;
		i8|=0x80;
		this.setCflag();
	} else {
		i8=i8>>1;
		i8&=0x7F;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* RL instuction: CY <- r7<-r0 <- CY
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity even; reset otherwise
N is reset
C is data from bit 7 of source register
*/
z80.z80RL=function(i8){
	i8&=0xff;
	if (0x80&i8) {
		i8=i8<<1;
		if (this.flagC) i8|=0x01;
		else i8&=0xFE;
		this.setCflag();
	} else {
		i8=i8<<1;
		if (this.flagC) i8|=0x01;
		else i8&=0xFE;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* RR instuction: CY -> r7->r0 -> CY
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity even; reset otherwise,
N is reset
C is data from bit 0 of source register
*/
z80.z80RR=function(i8){
	i8&=0xff;
	if (0x01&i8) {
		i8=i8>>1;
		if (this.flagC) i8|=0x80;
		else i8&=0x7F;
		this.setCflag();
	} else {
		i8=i8>>1;
		if (this.flagC) i8|=0x80;
		else i8&=0x7F;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* SLA instuction: CY <- r7<-r0 <- 0
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity is even; reset otherwise
N is reset
C is data from bit 7
*/
z80.z80SLA=function(i8){
	i8&=0xff;
	if (0x80&i8) {
		i8=i8<<1;
		i8&=0xFE;
		this.setCflag();
	} else {
		i8=i8<<1;
		i8&=0xFE;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* SRA instuction: r7 -> r7->r0 -> CY
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity is even; reset otherwise
N is reset
C is data from bit 0 of source register
*/
z80.z80SRA=function(i8){
	i8&=0xff;
	if (0x01&i8) {
		i8=i8>>1;
		if (0x40 & i8) i8|=0x80;
		else i8&=0x7F;
		this.setCflag();
	} else {
		i8=i8>>1;
		if (0x40 & i8) i8|=0x80;
		else i8&=0x7F;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* SRL instuction: 0 -> r7->r0 -> CY
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is reset
P/V is set if parity is even; reset otherwise
N is reset
C is data from bit 0 of source register
*/
z80.z80SRL=function(i8){
	i8&=0xff;
	if (0x01&i8) {
		i8=i8>>1;
		i8&=0x7F;
		this.setCflag();
	} else {
		i8=i8>>1;
		i8&=0x7F;
		this.clearCflag();
	}
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8==0x00) this.setZflag();
	else this.clearZflag();
	this.clearHflag();
	this.setZ80Parity(i8);
	this.clearNflag();
	return i8;
}

/* ADD HL,ss
S is not affected
Z is not affected
H is set if carry out of bit 11; reset otherwise
P/V is not affected
N is reset
C is set if carry from bit 15; reset otherwise
*/
z80.z80ADD16=function(reg16){
	var i16;
	var i32;
	i32=this.regHL;
	i32+=reg16;
	i16=this.regHL&0x0FFF;
	i16+=reg16&0x0FFF;
	i16&=0xFFFF;   // Force unsigned short
	i32&=0xFFFFFF; // Force unsigned long
	this.loadHL(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
}

/* SBC HL,ss
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
H is set if a borrow from bit 12; reset otherwise
P/V is set if overflow; reset otherwise
N is set
C is set if borrow; reset otherwise
*/
z80.z80SBC16=function(reg16){
	var i16;
	var i32;
	i32=this.regHL;
	i32-=reg16;
	i16=this.regHL&0x0FFF;
	i16-=reg16&0x0FFF;
	if (this.flagC) {
		i32--;
		i16--;
	}
	i16&=0xFFFF;   // Force unsigned short
	i32&=0xFFFFFF; // Force unsigned long
	this.loadHL(i32);
	if (0x8000&i32) this.setSflag();
	else this.clearSflag();
	if (i32) this.clearZflag();
	else this.setZflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	if (0xFFFF<i32) {
		this.setCflag();
		this.setPflag();
	} else {
		this.clearCflag();
		this.clearPflag();
	}
	this.setNflag();
}
/* ADC HL,ss
S is set if result is negative; reset otherwise
Z is set if result is zero; reset otherwise
R is set if carry out of bit 11;. reset otherwise
P/V is set if overflow; reset otherwise
N is reset
C is set if carry from bit 15; reset otherwise
*/
z80.z80ADC16=function(reg16){
	var i16;
	var i32;
	i32=this.regHL;
	i32+=reg16;
	i16=this.regHL&0x0FFF;
	i16+=reg16&0x0FFF;
	if (this.flagC) {
		i32++;
		i16++;
	}
	i16&=0xFFFF;   // Force unsigned short
	i32&=0xFFFFFF; // Force unsigned long
	this.loadHL(i32);
	if (0x8000&i32) this.setSflag();
	else this.clearSflag();
	if (i32) this.clearZflag();
	else this.setZflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	if (0xFFFF<i32) {
		this.setCflag();
		this.setPflag();
	} else {
		this.clearCflag();
		this.clearPflag();
	}
	this.clearNflag();
}

