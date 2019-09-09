/**********************************
* Z80 emulator written by Katsumi *
*           ver 0.80              *
*     This script is released     *
*       under the LGPL v2.1.      *
**********************************/

/*
	Public methods:
	z80.reset();
	z80.setSpeed(clk);
	z80.getMicroSec();
	z80.exec(msec);
	z80.interrupt(code);
	z80.nmr();
	
	Required outside methods:
	Methods written in z80functions.js.
	memory.read(addr);
	memory.write(addr,data);
	io.read(addrL,addrH);
	io.write(addrL,addrH,data);
	z80.events(); // optional
*/
z80=new Object();
z80.breakPoint=-1;
z80.step=0;
z80.m1=false;
z80.reset=function(){
	// 8 bit registers
	this.z80IM=0;
	this.regA=0;
	this.regF=0;
	this.regB=0;
	this.regC=0;
	this.regD=0;
	this.regE=0;
	this.regH=0;
	this.regL=0;
	this.regI=0;
	this.regR=0;
	this.regIXh=0;
	this.regIXl=0;
	this.regIYh=0;
	this.regIYl=0;
	this.regSPh=0;
	this.regSPl=0;
	// 16 bit registers
	this.regAF=0;
	this.regHL=0;
	this.regBC=0;
	this.regDE=0;
	this.regIX=0;
	this.regIY=0;
	this.regPC=0;
	this.regSP=0;
	// Prime registers
	this.regAFprime=0;
	this.regBCprime=0;
	this.regDEprime=0;
	this.regHLprime=0;
	// Flag register: SZ-H-PNC
	this.flagS=0;
	this.flagZ=0;
	this.flagH=0;
	this.flagP=0;
	this.flagN=0;
	this.flagC=0;
	// Interrupt flip flops
	this.flagIFF1=0;
	this.flagIFF2=0;
	this.regIM=0;
	// Interrupt request
	this.irq=0;
	this.nrq=0;
};
z80.intCode=0xff;
z80.interrupt=function(code){
	if (!this.flagIFF1) return;
	this.loadIFF1(0);
	this.loadIFF2(0);
	this.irq=1;
	this.intCode=code;
};
z80.nmr=function(){
	this.loadIFF1(0);
	this.irq=1;
	this.nrq=1;
};
z80.doInt=function(){
	this.irq=0;
	if (this.nrq) {
		// NMR
		this.nrq=0;
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC(0x0066);
	} else {
		// Mascable interrupt
		switch (this.regIM) {
			case 0:
				this.codeVector[this.intCode]();
				return;
			case 2:
				var addr=(this.regI<<8)|this.intCode;
				this.loadSP(this.regSP-2);
				memory.write(this.regSP,this.regPC&0xFF);
				memory.write(this.regSP+1,this.regPC>>8);
				this.loadPC(memory.read(addr)|(memory.read(addr+1)<<8));
				return;
			case 1:
			default:
				this.codeFF();
				return;
		}
	}
};
z80.speed=2000; // Default: 2 MHz
z80.setSpeed=function(clk){
	this.speed=Math.ceil(clk/1000);
};
z80.getMicroSec=function(){
	var ret=1000*this.clk/this.speed;
	return ret;
};
z80.events=function(){
	// The events function will be called every msec.
	// Override this function if required to use.
}

z80.clk=0;
z80.setT4=    function(){ this.clk+=4; }
z80.setT4_5=  function(){ this.clk+=4; }
z80.setT4_7=  function(){ this.clk+=4; }
z80.setT5=    function(){ this.clk+=5; }
z80.setT6=    function(){ this.clk+=6; }
z80.setT6_5=  function(){ this.clk+=6; }
z80.setT7=    function(){ this.clk+=7; }
z80.setT8=    function(){ this.clk+=8; }
z80.setT9=    function(){ this.clk+=9; }
z80.setT10=   function(){ this.clk+=10; }
z80.setT10_11=function(){ this.clk+=10; }
z80.setT11=   function(){ this.clk+=11; }
z80.setT11_10=function(){ this.clk+=11; }
z80.setT12=   function(){ this.clk+=12; }
z80.setT13=   function(){ this.clk+=13; }
z80.setT14=   function(){ this.clk+=14; }
z80.setT15=   function(){ this.clk+=15; }
z80.setT16=   function(){ this.clk+=16; }
z80.setT17=   function(){ this.clk+=17; }
z80.setT19=   function(){ this.clk+=19; }
z80.setT19_18=function(){ this.clk+=19; }
z80.setT20=   function(){ this.clk+=20; }
z80.setT21=   function(){ this.clk+=21; }
z80.setT23=   function(){ this.clk+=23; }

z80.loadA=function(x){
	this.regA=x&0xff;
	this.regAF=this.regA<<8 | this.regF;
};
z80.setFlags=function(){
	//Flag register: SZ-H-PNC
	this.flagS=this.regF & 0x80 ? 1:0;
	this.flagZ=this.regF & 0x40 ? 1:0;
	this.flagH=this.regF & 0x10 ? 1:0;
	this.flagP=this.regF & 0x04 ? 1:0;
	this.flagN=this.regF & 0x02 ? 1:0;
	this.flagC=this.regF & 0x01 ? 1:0;
}
z80.loadF=function(x){
	this.regF=x&0xff;
	this.regAF=this.regA<<8 | this.regF;
	this.setFlags();
};
z80.loadB=function(x){
	this.regB=x&0xff;
	this.regBC=this.regB<<8 | this.regC;
};
z80.loadC=function(x){
	this.regC=x&0xff;
	this.regBC=this.regB<<8 | this.regC;
};
z80.loadD=function(x){
	this.regD=x&0xff;
	this.regDE=this.regD<<8 | this.regE;
};
z80.loadE=function(x){
	this.regE=x&0xff;
	this.regDE=this.regD<<8 | this.regE;
};
z80.loadH=function(x){
	this.regH=x&0xff;
	this.regHL=this.regH<<8 | this.regL;
};
z80.loadL=function(x){
	this.regL=x&0xff;
	this.regHL=this.regH<<8 | this.regL;
};
z80.loadI=function(x){
	this.regI=x&0xff;
};
z80.loadR=function(x){
	this.regR=x&0x7f;
};
z80.loadIXh=function(x){
	this.regIXh=x&0xff;
	this.regIX=this.regIXh<<8 | this.regIXl;
};
z80.loadIXl=function(x){
	this.regIXl=x&0xff;
	this.regIX=this.regIXh<<8 | this.regIXl;
};
z80.loadIYh=function(x){
	this.regIYh=x&0xff;
	this.regIY=this.regIYh<<8 | this.regIYl;
};
z80.loadIYl=function(x){
	this.regIYl=x&0xff;
	this.regIY=this.regIYh<<8 | this.regIYl;
};
z80.loadSPh=function(x){
	this.regSPh=x&0xff;
	this.regSP=this.regSPh<<8 | this.regSPl;
};
z80.loadSPl=function(x){
	this.regSPl=x&0xff;
	this.regSP=this.regSPh<<8 | this.regSPl;
};
z80.loadIM=function(x){
	this.regIM=x&0x03;
};
z80.loadIFF1=function(x){
	this.flagIFF1=x&0x01;
};
z80.loadIFF2=function(x){
	this.flagIFF2=x&0x01;
};

z80.loadAF=function(x){
	this.regAF=x&0xffff;
	this.regA=this.regAF>>8;
	this.regF=this.regAF&0xff;
	this.setFlags();
};
z80.loadBC=function(x){
	this.regBC=x&0xffff;
	this.regB=this.regBC>>8;
	this.regC=this.regBC&0xff;
};

z80.loadDE=function(x){
	this.regDE=x&0xffff;
	this.regD=this.regDE>>8;
	this.regE=this.regDE&0xff;
};
z80.loadHL=function(x){
	this.regHL=x&0xffff;
	this.regH=this.regHL>>8;
	this.regL=this.regHL&0xff;
};
z80.loadPC=function(x){
	this.regPC=x&0xffff;
	this.regPCh=this.regPC>>8;
	this.regPCl=this.regPC&0xff;
};
z80.loadSP=function(x){
	this.regSP=x&0xffff;
	this.regSPh=this.regSP>>8;
	this.regSPl=this.regSP&0xff;
};
z80.loadIX=function(x){
	this.regIX=x&0xffff;
	this.regIXh=this.regIX>>8;
	this.regIXl=this.regIX&0xff;
};
z80.loadIY=function(x){
	this.regIY=x&0xffff;
	this.regIYh=this.regIY>>8;
	this.regIYl=this.regIY&0xff;
};
z80.loadAFprime=function(x){
	this.regAFprime=x&0xffff;
};
z80.loadBCprime=function(x){
	this.regBCprime=x&0xffff;
};
z80.loadDEprime=function(x){
	this.regDEprime=x&0xffff;
};
z80.loadHLprime=function(x){
	this.regHLprime=x&0xffff;
};
z80.getCode=function(){
	var code=memory.read(this.regPC);
	this.loadPC(this.regPC+1);
	return code;
};
z80.getCodeIndex=function(){
	var code=memory.read(this.regPC);
	this.loadPC(this.regPC+1);
	if (code&0x80) code-=256;
	return code;
};
/*	Code emulation routines follow */
z80.codeVOID=function(){
	//NOP with longest T cycles
	this.setT23();
};
z80.code00=function(){
	//NOP
	this.setT4();
};
z80.code01=function(){
	//LD BC,nn
	this.setT10();
	this.loadC(this.getCode());
	this.loadB(this.getCode());
};
z80.code02=function(){
	//LD (BC),A
	this.setT7();
	memory.write(this.regBC,this.regA);
};
z80.code03=function(){
	//INC BC
	//Note that 16-bit increment routine does not change flags.
	this.setT6_5();
	this.loadBC(this.regBC+1);
};
z80.code04=function(){
	//INC B
	this.setT4_5();
	var i8=this.regB+1;
	this.loadB(i8);
	this.flag8inc(i8);
};
z80.code05=function(){
	//DEC B
	this.setT4_5();
	var i8=this.regB-1;
	this.loadB(i8);
	this.flag8dec(i8);
};
z80.code06=function(){
	//LD B,n
	this.setT7();
	this.loadB(this.getCode());
};
z80.code07=function(){
	//RLCA  C <- A7<-A0 <- A7
/*
S is not affected
Z is not affected
H is reset
P/V is not affected
N is reset
C is data from bit 7 of Accumulator
*/
	this.setT4();
	if (this.regA&0x80) {
		this.setCflag();
		this.loadA((this.regA<<1) | 0x01);
	} else {
		this.clearCflag();
		this.loadA(this.regA<<1);
	}
	this.clearHflag();
	this.clearNflag();	
};
z80.code08=function(){
	//EX AF,AFf
	this.setT4();
	var i16=this.regAF;
	this.loadAF(this.regAFprime);
	this.loadAFprime(i16);
};
z80.code09=function(){
	//ADD HL,BC
	this.setT11_10();
	this.z80ADD16(this.regBC);
};
z80.code0A=function(){
	//LD A,(BC)
	this.setT7();
	this.loadA(memory.read(this.regBC));
};
z80.code0B=function(){
	//DEC BC
	this.setT6_5();
	this.loadBC(this.regBC-1);
};
z80.code0C=function(){
	//INC C
	this.setT4_5();
	var i8=this.regC+1;
	this.loadC(i8);
	this.flag8inc(i8);
};
z80.code0D=function(){
	//DEC C
	this.setT4_5();
	var i8=this.regC-1;
	this.loadC(i8);
	this.flag8dec(i8);
};
z80.code0E=function(){
	//LD C,n
	this.setT7();
	this.loadC(this.getCode());
};
z80.code0F=function(){
	//RRCA A0 -> A7->A0 ->C
	this.setT4();
/*
S is not affected
Z is not affected
H is reset
P/V is not affected
N is reset
C is data from bit 0 of Accumulator
*/
	if (this.regA&0x01) {
		this.setCflag();
		this.loadA((this.regA>>1) | 0x80);
	} else {
		this.clearCflag();
		this.loadA(this.regA>>1);
	}
	this.clearHflag();
	this.clearNflag();	
};
z80.code10=function(){
	//DJNZ (PC+e)
	var i8=this.regB-1;
	if (i8) {
		this.setT13();
		this.loadB(i8);
		this.z80JR();
	} else {
		this.setT8();
		this.loadB(i8);
		this.getCode();
	}
};
z80.code11=function(){
	//LD DE,nn
	this.setT10();
	this.loadE(this.getCode());
	this.loadD(this.getCode());
};
z80.code12=function(){
	//LD (DE),A
	this.setT7();
	memory.write(this.regDE,this.regA);
};
z80.code13=function(){
	//INC DE
	this.setT6_5();
	this.loadDE(this.regDE+1);
};
z80.code14=function(){
	//INC D
	this.setT4_5();
	var i8=this.regD+1;
	this.loadD(i8);
	this.flag8inc(i8);
};
z80.code15=function(){
	//DEC D
	this.setT4_5();
	var i8=this.regD-1;
	this.loadD(i8);
	this.flag8dec(i8);
};
z80.code16=function(){
	//LD D,n
	this.setT7();
	this.loadD(this.getCode());
};
z80.code17=function(){
	//RLA C<- A7<-A0 <-C
/*
S is not affected
Z is not affected
H is reset
P/V is not affected
N is reset
C is data from bit 7 of Accumulator
*/
	this.setT4();
	var i8=this.flagC;
	if (this.regA&0x80) this.setCflag();
	else this.clearCflag();		
	if (i8) this.loadA((this.regA<<1) | 0x01);
	else this.loadA(this.regA<<1);
	this.clearHflag();
	this.clearNflag();	
};
z80.code18=function(){
	//JR (PC+e)
	this.setT12();
	this.z80JR();
};
z80.code19=function(){
	//ADD HL,DE
	this.setT11_10();
	this.z80ADD16(this.regDE);
};
z80.code1A=function(){
	//LD A,(DE)
	this.setT7();
	this.loadA(memory.read(this.regDE));
};
z80.code1B=function(){
	//DEC DE
	this.setT6_5();
	this.loadDE(this.regDE-1);
};
z80.code1C=function(){
	//INC E
	this.setT4_5();
	var i8=this.regE+1;
	this.loadE(i8);
	this.flag8inc(i8);
};
z80.code1D=function(){
	//DEC E
	this.setT4_5();
	var i8=this.regE-1;
	this.loadE(i8);
	this.flag8dec(i8);
};
z80.code1E=function(){
	//LD E,n
	this.setT7();
	this.loadE(this.getCode());
};
z80.code1F=function(){
	//RRA C-> A7->A0 ->C
/*
S is not affected
Z is not affected
H is reset
P/V is not affected
N is reset
C is data from bit 0 of Accumulator
*/
	this.setT4();
	var i8=this.flagC;
	if (this.regA&0x01) this.setCflag();
	else this.clearCflag();		
	if (i8) this.loadA((this.regA>>1) | 0x80);
	else this.loadA(this.regA>>1);
	this.clearHflag();
	this.clearNflag();	
};
z80.code20=function(){
	//JR NZ,(PC+e)
	if (this.flagZ) {
		this.setT7();
		this.getCode();
	} else {
		this.setT12();
		this.z80JR();
	}
};
z80.code21=function(){
	//LD HL,nn
	this.setT10();
	this.loadL(this.getCode());
	this.loadH(this.getCode());
};
z80.code22=function(){
	//LD (nn),HL
	this.setT16();
	var i8=this.getCode();
	var i16=this.getCode()<<8;
	i16=i16 | i8;
	memory.write(i16,this.regL);
	memory.write(i16+1,this.regH);
};
z80.code23=function(){
	//INC HL
	this.setT6_5();
	this.loadHL(this.regHL+1);
};
z80.code24=function(){
	//INC H
	this.setT4_5();
	var i8=this.regH+1;
	this.loadH(i8);
	this.flag8inc(i8);
};
z80.code25=function(){
	//DEC H
	this.setT4_5();
	var i8=this.regH-1;
	this.loadH(i8);
	this.flag8dec(i8);
};
z80.code26=function(){
	//LD H,n
	this.setT7();
	this.loadH(this.getCode());
};
z80.code27=function(){
	//DAA
	//This code is faster than one using DAA table.
	var h=this.regA;
	this.setT4();
	if (!this.flagN) {
		if (!this.flagC) {
			if (!this.flagH) {
				if ((this.regA&0xF0)<0x90) {
					if ((this.regA&0x0F)<0x0A) {
						//this.loadA(this.regA+0x00);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0x06);
						//this.clearCflag();
					}
				} else if ((this.regA&0xF0)==0x90) {
					if ((this.regA&0x0F)<0x0A) {
						//this.loadA(this.regA+0x00);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0x66);
						this.setCflag();
					}
				} else {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0x60);
						this.setCflag();
					} else {
						this.loadA(this.regA+0x66);
						this.setCflag();
					}
				}
			} else {
				if ((this.regA&0xF0)<0x90) {
						this.loadA(this.regA+0x06);
						//this.clearCflag();
				} else if ((this.regA&0xF0)==0x90) {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0x06);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0x66);
						this.setCflag();
					}
				} else {
						this.loadA(this.regA+0x66);
						this.setCflag();
				}
			}
		} else {
			if (!this.flagH) {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0x60);
						//this.setCflag();
					} else {
						this.loadA(this.regA+0x66);
						//this.setCflag();
					}
			} else {
						this.loadA(this.regA+0x66);
						//this.setCflag();
			}
		}
	} else {
		if (!this.flagC) {
			if (!this.flagH) {
				if ((this.regA&0xF0)<0x90) {
					if ((this.regA&0x0F)<0x0A) {
						//this.loadA(this.regA+0x00);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0xFA);
						//this.clearCflag();
					}
				} else if ((this.regA&0xF0)==0x90) {
					if ((this.regA&0x0F)<0x0A) {
						//this.loadA(this.regA+0x00);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0x9A);
						this.setCflag();
					}
				} else {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0xA0);
						this.setCflag();
					} else {
						this.loadA(this.regA+0x9A);
						this.setCflag();
					}
				}
			} else {
				if ((this.regA&0xF0)<0x90) {
						this.loadA(this.regA+0xFA);
						//this.clearCflag();
				} else if ((this.regA&0xF0)==0x90) {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0xFA);
						//this.clearCflag();
					} else {
						this.loadA(this.regA+0x9A);
						this.setCflag();
					}
				} else {
						this.loadA(this.regA+0x9A);
						this.setCflag();
				}
			}
		} else {
			if (!this.flagH) {
					if ((this.regA&0x0F)<0x0A) {
						this.loadA(this.regA+0xA0);
						//this.setCflag();
					} else {
						this.loadA(this.regA+0x9A);
						//this.setCflag();
					}
			} else {
						this.loadA(this.regA+0x9A);
						//this.setCflag();
			}
		}
	}
/*
S is set if most-significant bit of Accumulator is 1 after operation; reset
otherwise
Z is set if Accumulator is zero after operation; reset otherwise
H, see instruction
P/V is set if Accumulator is even parity after operation; reset otherwise
N is not affected
C, see instruction
*/
	if (this.regA&0x80) this.setSflag();
	else this.clearSflag();
	if (this.regA) this.clearZflag();
	else this.setZflag();
	this.setZ80Parity(this.regA);
	if ((h^this.regA)&0x10) this.setHflag();
	else this.clearHflag();
};

z80.code28=function(){
	//JR Z,(PC+e)
	if (this.flagZ) {
		this.setT12();
		this.z80JR();
	} else {
		this.setT7();
		this.getCode();
	}
};
z80.code29=function(){
	//ADD HL,HL
	this.setT11_10();
	this.z80ADD16(this.regHL);
};
z80.code2A=function(){
	//LD HL,(nn)
	this.setT16();
	var i8=this.getCode();
	var i16=this.getCode()<<8;
	i16|=i8;
	this.loadL(memory.read(i16));
	this.loadH(memory.read(i16+1));
};
z80.code2B=function(){
	//DEC HL
	this.setT6_5();
	this.loadHL(this.regHL-1);
};
z80.code2C=function(){
	//INC L
	this.setT4_5();
	var i8=this.regL+1;
	this.loadL(i8);
	this.flag8inc(i8);
};
z80.code2D=function(){
	//DEC L
	this.setT4_5();
	var i8=this.regL-1;
	this.loadL(i8);
	this.flag8dec(i8);
};
z80.code2E=function(){
	//LD L,n
	this.setT7();
	this.loadL(this.getCode());
};
z80.code2F=function(){
	//CPL
/*
S is not affected
Z is not affected
H is set
P/V is not affected
N is set
C is not affected
*/
	this.setT4();
	this.loadA(~this.regA);
	this.setHflag();
	this.setNflag();
};
z80.code30=function(){
	//JR NC,(PC+e)
	if (this.flagC) {
		this.setT7();
		this.getCode();
	} else {
		this.setT12();
		this.z80JR();
	}
};
z80.code31=function(){
	//LD SP,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode()<<8;
	i16=i16 | i8;
	this.loadSP(i16);
};
z80.code32=function(){
	//LD (nn),A
	this.setT13();
	var i8=this.getCode();
	var i16=this.getCode()<<8;
	i16=i16 | i8;
	memory.write(i16,this.regA);
};
z80.code33=function(){
	//INC SP
	this.setT6_5();
	this.loadSP(this.regSP+1);
};
z80.code34=function(){
	//INC (HL)
	this.setT11_10();
	var i8=memory.read(this.regHL)+1;
	memory.write(this.regHL,i8);
	this.flag8inc(i8);
};
z80.code35=function(){
	//DEC (HL)
	this.setT11_10();
	var i8=memory.read(this.regHL)-1;
	memory.write(this.regHL,i8);
	this.flag8dec(i8);
};
z80.code36=function(){
	//LD (HL),n
	this.setT10();
	memory.write(this.regHL,this.getCode());
};
z80.code37=function(){
	//SCF
/*
S is not affected
Z is not affected
H is reset
P/V is not affected
N is reset
C is set
*/
	this.setT4();
	this.clearHflag();
	this.clearNflag();
	this.setCflag();
};
z80.code38=function(){
	//JR C,(PC+e)
	if (this.flagC) {
		this.setT12();
		this.z80JR();
	} else {
		this.setT7();
		this.getCode();
	}
};
z80.code39=function(){
	//ADD HL,SP
	this.setT11_10();
	this.z80ADD16(this.regSP);
};
z80.code3A=function(){
	//LD A,(nn)
	this.setT13();
	var i8=this.getCode();
	var i16=this.getCode()<<8;
	i16|=i8;
	this.loadA(memory.read(i16));
};
z80.code3B=function(){
	//DEC SP
	this.setT6_5();
	this.loadSP(this.regSP-1);
};
z80.code3C=function(){
	//INC A
	this.setT4_5();
	var i8=this.regA+1;
	this.loadA(i8);
	this.flag8inc(i8);
};
z80.code3D=function(){
	//DEC A
	this.setT4_5();
	var i8=this.regA-1;
	this.loadA(i8);
	this.flag8dec(i8);
};
z80.code3E=function(){
	//LD A,n
	this.setT7();
	this.loadA(this.getCode());
};
z80.code3F=function(){
	//CCF
/*
S is not affected
Z is not affected
H, previous carry is copied
P/V is not affected
N is reset
C is set if CY was 0 before operation; reset otherwise
*/
	this.setT4();
	if (this.flagC) {
		this.setHflag();
		this.clearCflag();
	} else {
		this.clearHflag();
		this.setCflag();
	}
	this.clearNflag();
};
z80.code40=function(){
	//LD B,B
	this.setT4_5();
	this.loadB(this.regB);
};
z80.code41=function(){
	//LD B,C
	this.setT4_5();
	this.loadB(this.regC);
};
z80.code42=function(){
	//LD B,D
	this.setT4_5();
	this.loadB(this.regD);
};
z80.code43=function(){
	//LD B,E
	this.setT4_5();
	this.loadB(this.regE);
};
z80.code44=function(){
	//LD B,H
	this.setT4_5();
	this.loadB(this.regH);
};
z80.code45=function(){
	//LD B,L
	this.setT4_5();
	this.loadB(this.regL);
};
z80.code46=function(){
	//LD B,(HL)
	this.setT7();
	this.loadB(memory.read(this.regHL));
};
z80.code47=function(){
	//LD B,A
	this.setT4_5();
	this.loadB(this.regA);
};
z80.code48=function(){
	//LD C,B
	this.setT4_5();
	this.loadC(this.regB);
};
z80.code49=function(){
	//LD C,C
	this.setT4_5();
	this.loadC(this.regC);
};
z80.code4A=function(){
	//LD C,D
	this.setT4_5();
	this.loadC(this.regD);
};
z80.code4B=function(){
	//LD C,E
	this.setT4_5();
	this.loadC(this.regE);
};
z80.code4C=function(){
	//LD C,H
	this.setT4_5();
	this.loadC(this.regH);
};
z80.code4D=function(){
	//LD C,L
	this.setT4_5();
	this.loadC(this.regL);
};
z80.code4E=function(){
	//LD C,(HL)
	this.setT7();
	this.loadC(memory.read(this.regHL));
};
z80.code4F=function(){
	//LD C,A
	this.setT4_5();
	this.loadC(this.regA);
};
z80.code50=function(){
	//LD D,B
	this.setT4_5();
	this.loadD(this.regB);
};
z80.code51=function(){
	//LD D,C
	this.setT4_5();
	this.loadD(this.regC);
};
z80.code52=function(){
	//LD D,D
	this.setT4_5();
	this.loadD(this.regD);
};
z80.code53=function(){
	//LD D,E
	this.setT4_5();
	this.loadD(this.regE);
};
z80.code54=function(){
	//LD D,H
	this.setT4_5();
	this.loadD(this.regH);
};
z80.code55=function(){
	//LD D,L
	this.setT4_5();
	this.loadD(this.regL);
};
z80.code56=function(){
	//LD D,(HL)
	this.setT7();
	this.loadD(memory.read(this.regHL));
};
z80.code57=function(){
	//LD D,A
	this.setT4_5();
	this.loadD(this.regA);
};
z80.code58=function(){
	//LD E,B
	this.setT4_5();
	this.loadE(this.regB);
};
z80.code59=function(){
	//LD E,C
	this.setT4_5();
	this.loadE(this.regC);
};
z80.code5A=function(){
	//LD E,D
	this.setT4_5();
	this.loadE(this.regD);
};
z80.code5B=function(){
	//LD E,E
	this.setT4_5();
	this.loadE(this.regE);
};
z80.code5C=function(){
	//LD E,H
	this.setT4_5();
	this.loadE(this.regH);
};
z80.code5D=function(){
	//LD E,L
	this.setT4_5();
	this.loadE(this.regL);
};
z80.code5E=function(){
	//LD E,(HL)
	this.setT7();
	this.loadE(memory.read(this.regHL));
};
z80.code5F=function(){
	//LD E,A
	this.setT4_5();
	this.loadE(this.regA);
};
z80.code60=function(){
	//LD H,B
	this.setT4_5();
	this.loadH(this.regB);
};
z80.code61=function(){
	//LD H,C
	this.setT4_5();
	this.loadH(this.regC);
};
z80.code62=function(){
	//LD H,D
	this.setT4_5();
	this.loadH(this.regD);
};
z80.code63=function(){
	//LD H,E
	this.setT4_5();
	this.loadH(this.regE);
};
z80.code64=function(){
	//LD H,H
	this.setT4_5();
	this.loadH(this.regH);
};
z80.code65=function(){
	//LD H,L
	this.setT4_5();
	this.loadH(this.regL);
};
z80.code66=function(){
	//LD H,(HL)
	this.setT7();
	this.loadH(memory.read(this.regHL));
};
z80.code67=function(){
	//LD H,A
	this.setT4_5();
	this.loadH(this.regA);
};
z80.code68=function(){
	//LD L,B
	this.setT4_5();
	this.loadL(this.regB);
};
z80.code69=function(){
	//LD L,C
	this.setT4_5();
	this.loadL(this.regC);
};
z80.code6A=function(){
	//LD L,D
	this.setT4_5();
	this.loadL(this.regD);
};
z80.code6B=function(){
	//LD L,E
	this.setT4_5();
	this.loadL(this.regE);
};
z80.code6C=function(){
	//LD L,H
	this.setT4_5();
	this.loadL(this.regH);
};
z80.code6D=function(){
	//LD L,L
	this.setT4_5();
	this.loadL(this.regL);
};
z80.code6E=function(){
	//LD L,(HL)
	this.setT7();
	this.loadL(memory.read(this.regHL));
};
z80.code6F=function(){
	//LD L,A
	this.setT4_5();
	this.loadL(this.regA);
};
z80.code70=function(){
	//LD (HL),B
	this.setT7();
	memory.write(this.regHL,this.regB);
};
z80.code71=function(){
	//LD (HL),C
	this.setT7();
	memory.write(this.regHL,this.regC);
};
z80.code72=function(){
	//LD (HL),D
	this.setT7();
	memory.write(this.regHL,this.regD);
};
z80.code73=function(){
	//LD (HL),E
	this.setT7();
	memory.write(this.regHL,this.regE);
};
z80.code74=function(){
	//LD (HL),H
	this.setT7();
	memory.write(this.regHL,this.regH);
};
z80.code75=function(){
	//LD (HL),L
	this.setT7();
	memory.write(this.regHL,this.regL);
};
z80.code76=function(){
	//HALT
	this.setT4_7();
	this.loadPC(this.regPC-1);
};
z80.code77=function(){
	//LD (HL),A
	this.setT7();
	memory.write(this.regHL,this.regA);
};
z80.code78=function(){
	//LD A,B
	this.setT4_5();
	this.loadA(this.regB);
};
z80.code79=function(){
	//LD A,C
	this.setT4_5();
	this.loadA(this.regC);
};
z80.code7A=function(){
	//LD A,D
	this.setT4_5();
	this.loadA(this.regD);
};
z80.code7B=function(){
	//LD A,E
	this.setT4_5();
	this.loadA(this.regE);
};
z80.code7C=function(){
	//LD A,H
	this.setT4_5();
	this.loadA(this.regH);
};
z80.code7D=function(){
	//LD A,L
	this.setT4_5();
	this.loadA(this.regL);
};
z80.code7E=function(){
	//LD A,(HL)
	this.setT7();
	this.loadA(memory.read(this.regHL));
};
z80.code7F=function(){
	//LD A,A
	this.setT4_5();
	this.loadA(this.regA);
};
z80.code80=function(){
	//ADD A,B
	this.setT4();
	this.z80ADD(this.regB);
};
z80.code81=function(){
	//ADD A,C
	this.setT4();
	this.z80ADD(this.regC);
};
z80.code82=function(){
	//ADD A,D
	this.setT4();
	this.z80ADD(this.regD);
};
z80.code83=function(){
	//ADD A,E
	this.setT4();
	this.z80ADD(this.regE);
};
z80.code84=function(){
	//ADD A,H
	this.setT4();
	this.z80ADD(this.regH);
};
z80.code85=function(){
	//ADD A,L
	this.setT4();
	this.z80ADD(this.regL);
};
z80.code86=function(){
	//ADD A,(HL)
	this.setT7();
	this.z80ADD(memory.read(this.regHL));
};
z80.code87=function(){
	//ADD A,A
	this.setT4();
	this.z80ADD(this.regA);
};
z80.code88=function(){
	//ADC A,B
	this.setT4();
	this.z80ADC(this.regB);
};
z80.code89=function(){
	//ADC A,C
	this.setT4();
	this.z80ADC(this.regC);
};
z80.code8A=function(){
	//ADC A,D
	this.setT4();
	this.z80ADC(this.regD);
};
z80.code8B=function(){
	//ADC A,E
	this.setT4();
	this.z80ADC(this.regE);
};
z80.code8C=function(){
	//ADC A,H
	this.setT4();
	this.z80ADC(this.regH);
};
z80.code8D=function(){
	//ADC A,L
	this.setT4();
	this.z80ADC(this.regL);
};
z80.code8E=function(){
	//ADC A,(HL)
	this.setT7();
	this.z80ADC(memory.read(this.regHL));
};
z80.code8F=function(){
	//ADC A,A
	this.setT4();
	this.z80ADC(this.regA);
};
z80.code90=function(){
	//SUB B
	this.setT4();
	this.z80SUB(this.regB);
};
z80.code91=function(){
	//SUB C
	this.setT4();
	this.z80SUB(this.regC);
};
z80.code92=function(){
	//SUB D
	this.setT4();
	this.z80SUB(this.regD);
};
z80.code93=function(){
	//SUB E
	this.setT4();
	this.z80SUB(this.regE);
};
z80.code94=function(){
	//SUB H
	this.setT4();
	this.z80SUB(this.regH);
};
z80.code95=function(){
	//SUB L
	this.setT4();
	this.z80SUB(this.regL);
};
z80.code96=function(){
	//SUB (HL)
	this.setT7();
	this.z80SUB(memory.read(this.regHL));
};
z80.code97=function(){
	//SUB A
	this.setT4();
	this.z80SUB(this.regA);
};
z80.code98=function(){
	//SBC A,B
	this.setT4();
	this.z80SBC(this.regB);
};
z80.code99=function(){
	//SBC A,C
	this.setT4();
	this.z80SBC(this.regC);
};
z80.code9A=function(){
	//SBC A,D
	this.setT4();
 	this.z80SBC(this.regD);
};
z80.code9B=function(){
	//SBC A,E
	this.setT4();
	this.z80SBC(this.regE);
};
z80.code9C=function(){
	//SBC A,H
	this.setT4();
	this.z80SBC(this.regH);
};
z80.code9D=function(){
	//SBC A,L
	this.setT4();
	this.z80SBC(this.regL);
};
z80.code9E=function(){
	//SBC A,(HL)
	this.setT7();
	this.z80SBC(memory.read(this.regHL));
};
z80.code9F=function(){
	//SBC A,A
	this.setT4();
	this.z80SBC(this.regA);
};
z80.codeA0=function(){
	//AND B
	this.setT4();
	this.z80AND(this.regB);
};
z80.codeA1=function(){
	//AND C
	this.setT4();
	this.z80AND(this.regC);
};
z80.codeA2=function(){
	//AND D
	this.setT4();
	this.z80AND(this.regD);
};
z80.codeA3=function(){
	//AND E
	this.setT4();
	this.z80AND(this.regE);
};
z80.codeA4=function(){
	//AND H
	this.setT4();
	this.z80AND(this.regH);
};
z80.codeA5=function(){
	//AND L
	this.setT4();
	this.z80AND(this.regL);
};
z80.codeA6=function(){
	//AND (HL)
	this.setT7();
	this.z80AND(memory.read(this.regHL));
};
z80.codeA7=function(){
	//AND A
	this.setT4();
	this.z80AND(this.regA);
};
z80.codeA8=function(){
	//XOR B
	this.setT4();
	this.z80XOR(this.regB);
};
z80.codeA9=function(){
	//XOR C
	this.setT4();
	this.z80XOR(this.regC);
};
z80.codeAA=function(){
	//XOR D
	this.setT4();
	this.z80XOR(this.regD);
};
z80.codeAB=function(){
	//XOR E
	this.setT4();
	this.z80XOR(this.regE);
};
z80.codeAC=function(){
	//XOR H
	this.setT4();
	this.z80XOR(this.regH);
};
z80.codeAD=function(){
	//XOR L
	this.setT4();
	this.z80XOR(this.regL);
};
z80.codeAE=function(){
	//XOR (HL)
	this.setT7();
	this.z80XOR(memory.read(this.regHL));
};
z80.codeAF=function(){
	//XOR A
	this.setT4();
	this.z80XOR(this.regA);
};
z80.codeB0=function(){
	//OR B
	this.setT4();
	this.z80OR(this.regB);
};
z80.codeB1=function(){
	//OR C
	this.setT4();
	this.z80OR(this.regC);
};
z80.codeB2=function(){
	//OR D
	this.setT4();
	this.z80OR(this.regD);
};
z80.codeB3=function(){
	//OR E
	this.setT4();
	this.z80OR(this.regE);
};
z80.codeB4=function(){
	//OR H
	this.setT4();
	this.z80OR(this.regH);
};
z80.codeB5=function(){
	//OR L
	this.setT4();
	this.z80OR(this.regL);
};
z80.codeB6=function(){
	//OR (HL)
	this.setT7();
	this.z80OR(memory.read(this.regHL));
};
z80.codeB7=function(){
	//OR A
	this.setT4();
	this.z80OR(this.regA);
};
z80.codeB8=function(){
	//CP B
	this.setT4();
	this.z80CP(this.regB);
};
z80.codeB9=function(){
	//CP C
	this.setT4();
	this.z80CP(this.regC);
};
z80.codeBA=function(){
	//CP D
	this.setT4();
	this.z80CP(this.regD);
};
z80.codeBB=function(){
	//CP E
	this.setT4();
	this.z80CP(this.regE);
};
z80.codeBC=function(){
	//CP H
	this.setT4();
	this.z80CP(this.regH);
};
z80.codeBD=function(){
	//CP L
	this.setT4();
	this.z80CP(this.regL);
};
z80.codeBE=function(){
	//CP (HL)
	this.setT7();
	this.z80CP(memory.read(this.regHL));
};
z80.codeBF=function(){
	//CP A
	this.setT4();
	this.z80CP(this.regA);
};
z80.codeC0=function(){
	//RET NZ
	if (this.flagZ) {
		this.setT5();
	} else {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	}
};
z80.codeC1=function(){
	//POP BC
	this.setT10();
	this.loadC(memory.read(this.regSP));
	this.loadB(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeC2=function(){
	//JP NZ,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (!this.flagZ) this.loadPC( (i16<<8) | i8);
};
z80.codeC3=function(){
	//JP nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	this.loadPC( (i16<<8) | i8);
};
z80.codeC4=function(){
	//CALL NZ,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagZ){
		this.setT10_11();
	} else {
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	}
};
z80.codeC5=function(){
	//PUSH BC
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regC);
	memory.write(this.regSP+1,this.regB);
};
z80.codeC6=function(){
	//ADD A,n
	this.setT7();
	this.z80ADD(this.getCode());
};
z80.codeC7=function(){
	//RST 0H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x00);
};
z80.codeC8=function(){
	//RET Z
	if (this.flagZ) {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	} else {
		this.setT5();
	}
};
z80.codeC9=function(){
	//RET
	this.setT10();
	var i8=memory.read(this.regSP);
	var i16=memory.read(this.regSP+1)<<8;
	i16|=i8;
	this.loadPC(i16);
	this.loadSP(this.regSP+2);
};
z80.codeCA=function(){
	//JP Z,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagZ) this.loadPC( (i16<<8) | i8);
};
z80.codeCC=function(){
	//CALL Z,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagZ){
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	} else {
		this.setT10_11();
	}
};
z80.codeCD=function(){
	//CALL nn
	this.setT17();
	var i8=this.getCode();
	var i16=this.getCode();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC((i16<<8)|i8);
};
z80.codeCE=function(){
	//ADC A,n
	this.setT7();
	this.z80ADC(this.getCode());
};
z80.codeCF=function(){
	//RST 8H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x08);
};
z80.codeD0=function(){
	//RET NC
	if (this.flagC) {
		this.setT5();
	} else {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	}
};
z80.codeD1=function(){
	//POP DE
	this.setT10();
	this.loadE(memory.read(this.regSP));
	this.loadD(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeD2=function(){
	//JP NC,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (!this.flagC) this.loadPC( (i16<<8) | i8);
};
z80.codeD3=function(){
	//OUT (n),A
	this.setT11_10();
	io.write(this.getCode(),this.regA,this.regA);
};
z80.codeD4=function(){
	//CALL NC,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagC){
		this.setT10_11();
	} else {
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	}
};
z80.codeD5=function(){
	//PUSH DE
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regE);
	memory.write(this.regSP+1,this.regD);
};
z80.codeD6=function(){
	//SUB n
	this.setT7();
	this.z80SUB(this.getCode());
};
z80.codeD7=function(){
	//RST 10H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x10);
};
z80.codeD8=function(){
	//RET C
	if (this.flagC) {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	} else {
		this.setT5();
	}
};
z80.codeD9=function(){
	//EXX
	this.setT4();
	var i16=this.regBC;
	this.loadBC(this.regBCprime);
	this.loadBCprime(i16);
	i16=this.regDE;
	this.loadDE(this.regDEprime);
	this.loadDEprime(i16);
	i16=this.regHL;
	this.loadHL(this.regHLprime);
	this.loadHLprime(i16);
};
z80.codeDA=function(){
	//JP C,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagC) this.loadPC( (i16<<8) | i8);
};
z80.codeDB=function(){
	//IN A,n
	this.setT11_10();
	this.loadA(io.read(this.getCode(), this.regA));
};
z80.codeDC=function(){
	//CALL C,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagC){
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	} else {
		this.setT10_11();
	}
};
z80.codeDE=function(){
	//SBC   A,n
	this.setT7();
	this.z80SBC(this.getCode());
};
z80.codeDF=function(){
	//RST   18H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x18);
};
z80.codeE0=function(){
	//RET   PO
	if (this.flagP) {
		this.setT5();
	} else {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	}
};
z80.codeE1=function(){
	//POP   HL
	this.setT10();
	this.loadL(memory.read(this.regSP));
	this.loadH(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeE2=function(){
	//E2   JP    PO,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (!this.flagP) this.loadPC( (i16<<8) | i8);
};
z80.codeE3=function(){
	//EX    (SP),HL
	this.setT19_18();
	var i16=memory.read(this.regSP+1)<<8;
	i16|=memory.read(this.regSP);
	memory.write(this.regSP,this.regL);
	memory.write(this.regSP+1,this.regH);
	this.loadHL(i16);
};
z80.codeE4=function(){
	//CALL  PO,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagP){
		this.setT10_11();
	} else {
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	}
};
z80.codeE5=function(){
	//PUSH  HL
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regL);
	memory.write(this.regSP+1,this.regH);
};
z80.codeE6=function(){
	//AND   n
	this.setT7();
	this.z80AND(this.getCode());
};
z80.codeE7=function(){
	//RST   20H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x20);
};
z80.codeE8=function(){
	//RET   PE
	if (this.flagP) {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	} else {
		this.setT5();
	}
};
z80.codeE9=function(){
	//JP    (HL)
	this.setT4_5();
	this.loadPC(this.regHL);
};
z80.codeEA=function(){
	//JP    PE,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagP) this.loadPC( (i16<<8) | i8);
};
z80.codeEB=function(){
	//EX    DE,HL
	this.setT4();
	var i16=this.regHL;
	this.loadHL(this.regDE);
	this.loadDE(i16);
};
z80.codeEC=function(){
	//CALL  PE,NN
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagP){
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	} else {
		this.setT10_11();
	}
};
z80.codeEE=function(){
	//XOR   n
	this.setT7();
	this.z80XOR(this.getCode());
};
z80.codeEF=function(){
	//RST   28H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x28);
};
z80.codeF0=function(){
	//RET   P
	if (this.flagS) {
		this.setT5();
	} else {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	}
};
z80.codeF1=function(){
	//POP   AF
	this.setT10();
	this.loadF(memory.read(this.regSP));
	this.loadA(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeF2=function(){
	//F2   JP    P,nn
	this.setT10();
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (!this.flagS) this.loadPC( (i16<<8) | i8);
};
z80.codeF3=function(){
	//DI
	this.setT4();
	this.loadIFF1(0);
	this.loadIFF2(0);
};
z80.codeF4=function(){
	//CALL  P,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagS){
		this.setT10_11();
	} else {
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	}
};
z80.codeF5=function(){
	//PUSH  AF
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regF);
	memory.write(this.regSP+1,this.regA);
};
z80.codeF6=function(){
	//F6   OR    n
	this.setT7();
	this.z80OR(this.getCode());
};
z80.codeF7=function(){
	//RST   30H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x30);
};
z80.codeF8=function(){
	//RET   M
	if (this.flagS) {
		this.setT11();
		var i8=memory.read(this.regSP);
		var i16=memory.read(this.regSP+1)<<8;
		i16|=i8;
		this.loadPC(i16);
		this.loadSP(this.regSP+2);
	} else {
		this.setT5();
	}
};
z80.codeF9=function(){
	//LD    SP,HL
	this.setT6_5();
	this.loadSP(this.regHL);
};
z80.codeFA=function(){
	//FA   JP    M,nn
	this.setT10();
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagS) this.loadPC( (i16<<8) | i8);
};
z80.codeFB=function(){
	//EI
	this.setT4();
	this.loadIFF1(1);
	this.loadIFF2(1);
};
z80.codeFC=function(){
	//CALL  M,nn
	var i8=this.getCode();
	var i16=this.getCode();
	if (this.flagS){
		this.setT17();
		this.loadSP(this.regSP-2);
		memory.write(this.regSP,this.regPC&0xFF);
		memory.write(this.regSP+1,this.regPC>>8);
		this.loadPC((i16<<8)|i8);
	} else {
		this.setT10_11();
	}
};
z80.codeFE=function(){
	//FE   CP    n
	this.setT7();
	this.z80CP(this.getCode());
};
z80.codeFF=function(){
	//RST   38H
	this.setT11();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regPC&0xFF);
	memory.write(this.regSP+1,this.regPC>>8);
	this.loadPC(0x38);
};
z80.codeCB00=function(){
	//RLC   B
	this.setT8();
	this.loadB(this.z80RLC(this.regB));
};
z80.codeCB01=function(){
	//RLC   C
	this.setT8();
	this.loadC(this.z80RLC(this.regC));
};
z80.codeCB02=function(){
	//RLC   D
	this.setT8();
	this.loadD(this.z80RLC(this.regD));
};
z80.codeCB03=function(){
	//RLC   E
	this.setT8();
	this.loadE(this.z80RLC(this.regE));
};
z80.codeCB04=function(){
	//RLC   H
	this.setT8();
	this.loadH(this.z80RLC(this.regH));
};
z80.codeCB05=function(){
	//RLC   L
	this.setT8();
	this.loadL(this.z80RLC(this.regL));
};
z80.codeCB06=function(){
	//RLC   (HL)
	this.setT15();
	memory.write(this.regHL,this.z80RLC(memory.read(this.regHL)));
};
z80.codeCB07=function(){
	//RLC   A
	this.setT8();
	this.loadA(this.z80RLC(this.regA));
};
z80.codeCB08=function(){
	//RRC   B
	this.setT8();
	this.loadB(this.z80RRC(this.regB));
};
z80.codeCB09=function(){
	//RRC   C
	this.setT8();
	this.loadC(this.z80RRC(this.regC));
};
z80.codeCB0A=function(){
	//CRRC   D
	this.setT8();
	this.loadD(this.z80RRC(this.regD));
};
z80.codeCB0B=function(){
	//RRC   E
	this.setT8();
	this.loadE(this.z80RRC(this.regE));
};
z80.codeCB0C=function(){
	//RRC   H
	this.setT8();
	this.loadH(this.z80RRC(this.regH));
};
z80.codeCB0D=function(){
	//RRC   L
	this.setT8();
	this.loadL(this.z80RRC(this.regL));
};
z80.codeCB0E=function(){
	//RRC   (HL)
	this.setT15();
	memory.write(this.regHL,this.z80RRC(memory.read(this.regHL)));
};
z80.codeCB0F=function(){
	//RRC   A
	this.setT8();
	this.loadA(this.z80RRC(this.regA));
};
z80.codeCB10=function(){
	//RL    B
	this.setT8();
	this.loadB(this.z80RL(this.regB));
};
z80.codeCB11=function(){
	//RL    C
	this.setT8();
	this.loadC(this.z80RL(this.regC));
};
z80.codeCB12=function(){
	//RL    D
	this.setT8();
	this.loadD(this.z80RL(this.regD));
};
z80.codeCB13=function(){
	//RL    E
	this.setT8();
	this.loadE(this.z80RL(this.regE));
};
z80.codeCB14=function(){
	//RL    H
	this.setT8();
	this.loadH(this.z80RL(this.regH));
};
z80.codeCB15=function(){
	//RL    L
	this.setT8();
	this.loadL(this.z80RL(this.regL));
};
z80.codeCB16=function(){
	//RL    (HL)
	this.setT15();
	memory.write(this.regHL,this.z80RL(memory.read(this.regHL)));
};
z80.codeCB17=function(){
	//RL    A
	this.setT8();
	this.loadA(this.z80RL(this.regA));
};
z80.codeCB18=function(){
	//CB 18   RR    B
	this.setT8();
	this.loadB(this.z80RR(this.regB));
};
z80.codeCB19=function(){
	//CB 19   RR    C
	this.setT8();
	this.loadC(this.z80RR(this.regC));
};
z80.codeCB1A=function(){
	//CB 1A   RR    D
	this.setT8();
	this.loadD(this.z80RR(this.regD));
};
z80.codeCB1B=function(){
	//CB 1B   RR    E
	this.setT8();
	this.loadE(this.z80RR(this.regE));
};
z80.codeCB1C=function(){
	//CB 1C   RR    H
	this.setT8();
	this.loadH(this.z80RR(this.regH));
};
z80.codeCB1D=function(){
	//CB 1D   RR    L
	this.setT8();
	this.loadL(this.z80RR(this.regL));
};
z80.codeCB1E=function(){
	//CB 1E   RR    (HL)
	this.setT15();
	memory.write(this.regHL,this.z80RR(memory.read(this.regHL)));
};
z80.codeCB1F=function(){
	//CB 1F   RR    A
	this.setT8();
	this.loadA(this.z80RR(this.regA));
};
z80.codeCB20=function(){
	//SLA   B
	this.setT8();
	this.loadB(this.z80SLA(this.regB));
};
z80.codeCB21=function(){
	//SLA   C
	this.setT8();
	this.loadC(this.z80SLA(this.regC));
};
z80.codeCB22=function(){
	//SLA   D
	this.setT8();
	this.loadD(this.z80SLA(this.regD));
};
z80.codeCB23=function(){
	//SLA   E
	this.setT8();
	this.loadE(this.z80SLA(this.regE));
};
z80.codeCB24=function(){
	//SLA   H
	this.setT8();
	this.loadH(this.z80SLA(this.regH));
};
z80.codeCB25=function(){
	//SLA   L
	this.setT8();
	this.loadL(this.z80SLA(this.regL));
};
z80.codeCB26=function(){
	//SLA   (HL)
	this.setT15();
	memory.write(this.regHL,this.z80SLA(memory.read(this.regHL)));
};
z80.codeCB27=function(){
	//SLA   A
	this.setT8();
	this.loadA(this.z80SLA(this.regA));
};
z80.codeCB28=function(){
	//SRA   B
	this.setT8();
	this.loadB(this.z80SRA(this.regB));
};
z80.codeCB29=function(){
	//SRA   C
	this.setT8();
	this.loadC(this.z80SRA(this.regC));
};
z80.codeCB2A=function(){
	//SRA   D
	this.setT8();
	this.loadD(this.z80SRA(this.regD));
};
z80.codeCB2B=function(){
	//SRA   E
	this.setT8();
	this.loadE(this.z80SRA(this.regE));
};
z80.codeCB2C=function(){
	//SRA   H
	this.setT8();
	this.loadH(this.z80SRA(this.regH));
};
z80.codeCB2D=function(){
	//SRA   L
	this.setT8();
	this.loadL(this.z80SRA(this.regL));
};
z80.codeCB2E=function(){
	//SRA   (HL)
	this.setT15();
	memory.write(this.regHL,this.z80SRA(memory.read(this.regHL)));
};
z80.codeCB2F=function(){
	//SRA   A
	this.setT8();
	this.loadA(this.z80SRA(this.regA));
};
z80.codeCB38=function(){
	//SRL   B
	this.setT8();
	this.loadB(this.z80SRL(this.regB));
};
z80.codeCB39=function(){
	//SRL   C
	this.setT8();
	this.loadC(this.z80SRL(this.regC));
};
z80.codeCB3A=function(){
	//SRL   D
	this.setT8();
	this.loadD(this.z80SRL(this.regD));
};
z80.codeCB3B=function(){
	//SRL   E
	this.setT8();
	this.loadE(this.z80SRL(this.regE));
};
z80.codeCB3C=function(){
	//SRL   H
	this.setT8();
	this.loadH(this.z80SRL(this.regH));
};
z80.codeCB3D=function(){
	//SRL   L
	this.setT8();
	this.loadL(this.z80SRL(this.regL));
};
z80.codeCB3E=function(){
	//SRL   (HL)
	this.setT15();
	memory.write(this.regHL,this.z80SRL(memory.read(this.regHL)));
};
z80.codeCB3F=function(){
	//SRL   A
	this.setT8();
	this.loadA(this.z80SRL(this.regA));
};
z80.codeCB40=function(){
	//BIT   0,B
/*
S is unknown
Z is set if specified bit is 0; reset otherwise
H is set
P/V is unknown
N is reset
C is not affected
*/
	this.setT8();
	if (0x01&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB41=function(){
	//BIT   0,C
	this.setT8();
	if (0x01&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB42=function(){
	//BIT   0,D
	this.setT8();
	if (0x01&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB43=function(){
	//BIT   0,E
	this.setT8();
	if (0x01&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB44=function(){
	//BIT   0,H
	this.setT8();
	if (0x01&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB45=function(){
	//BIT   0,L
	this.setT8();
	if (0x01&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB46=function(){
	//BIT   0,(HL)
	this.setT12();
	if (0x01&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB47=function(){
	//BIT   0,A
	this.setT8();
	if (0x01&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB48=function(){
	//BIT   1,B
	this.setT8();
	if (0x02&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB49=function(){
	//BIT   1,C
	this.setT8();
	if (0x02&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4A=function(){
	//BIT   1,D
	this.setT8();
	if (0x02&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4B=function(){
	//BIT   1,E
	this.setT8();
	if (0x02&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4C=function(){
	//BIT   1,H
	this.setT8();
	if (0x02&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4D=function(){
	//BIT   1,L
	this.setT8();
	if (0x02&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4E=function(){
	//BIT   1,(HL)
	this.setT12();
	if (0x02&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB4F=function(){
	//BIT   1,A
	this.setT12();
	if (0x02&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB50=function(){
	//BIT   2,B
	this.setT8();
	if (0x04&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB51=function(){
	//BIT   2,C
	this.setT8();
	if (0x04&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB52=function(){
	//BIT   2,D
	this.setT8();
	if (0x04&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB53=function(){
	//BIT   2,E
	this.setT8();
	if (0x04&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB54=function(){
	//BIT   2,H
	this.setT8();
	if (0x04&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB55=function(){
	//BIT   2,L
	this.setT8();
	if (0x04&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB56=function(){
	//BIT   2,(HL)
	this.setT12();
	if (0x04&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB57=function(){
	//BIT   2,A
	this.setT8();
	if (0x04&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB58=function(){
	//BIT   3,B
	this.setT8();
	if (0x08&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB59=function(){
	//BIT   3,C
	this.setT8();
	if (0x08&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5A=function(){
	//BIT   3,D
	this.setT8();
	if (0x08&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5B=function(){
	//BIT   3,E
	this.setT8();
	if (0x08&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5C=function(){
	//BIT   3,H
	this.setT8();
	if (0x08&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5D=function(){
	//BIT   3,L
	this.setT8();
	if (0x08&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5E=function(){
	//BIT   3,(HL)
	this.setT12();
	if (0x08&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB5F=function(){
	//BIT   3,A
	this.setT8();
	if (0x08&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB60=function(){
	//BIT   4,B
	this.setT8();
	if (0x10&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB61=function(){
	//BIT   4,C
	this.setT8();
	if (0x10&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB62=function(){
	//BIT   4,D
	this.setT8();
	if (0x10&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB63=function(){
	//BIT   4,E
	this.setT8();
	if (0x10&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB64=function(){
	//BIT   4,H
	this.setT8();
	if (0x10&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB65=function(){
	//BIT   4,L
	this.setT8();
	if (0x10&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB66=function(){
	//BIT   4,(HL)
	this.setT12();
	if (0x10&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB67=function(){
	//BIT   4,A
	this.setT8();
	if (0x10&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB68=function(){
	//BIT   5,B
	this.setT8();
	if (0x20&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB69=function(){
	//BIT   5,C
	this.setT8();
	if (0x20&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6A=function(){
	//BIT   5,D
	this.setT8();
	if (0x20&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6B=function(){
	//BIT   5,E
	this.setT8();
	if (0x20&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6C=function(){
	//BIT   5,H
	this.setT8();
	if (0x20&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6D=function(){
	//BIT   5,L
	this.setT8();
	if (0x20&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6E=function(){
	//BIT   5,(HL)
	this.setT12();
	if (0x20&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB6F=function(){
	//BIT   5,A
	this.setT8();
	if (0x20&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB70=function(){
	//BIT   6,B
	this.setT8();
	if (0x40&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB71=function(){
	//BIT   6,C
	this.setT8();
	if (0x40&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB72=function(){
	//BIT   6,D
	this.setT8();
	if (0x40&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB73=function(){
	//BIT   6,E
	this.setT8();
	if (0x40&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB74=function(){
	//BIT   6,H
	this.setT8();
	if (0x40&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB75=function(){
	//BIT   6,L
	this.setT8();
	if (0x40&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB76=function(){
	//BIT   6,(HL)
	this.setT12();
	if (0x40&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB77=function(){
	//BIT   6,A
	this.setT8();
	if (0x40&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB78=function(){
	//BIT   7,B
	this.setT8();
	if (0x80&this.regB) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB79=function(){
	//BIT   7,C
	this.setT8();
	if (0x80&this.regC) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7A=function(){
	//BIT   7,D
	this.setT8();
	if (0x80&this.regD) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7B=function(){
	//BIT   7,E
	this.setT8();
	if (0x80&this.regE) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7C=function(){
	//BIT   7,H
	this.setT8();
	if (0x80&this.regH) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7D=function(){
	//BIT   7,L
	this.setT8();
	if (0x80&this.regL) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7E=function(){
	//BIT   7,(HL)
	this.setT12();
	if (0x80&memory.read(this.regHL)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB7F=function(){
	//BIT   7,A
	this.setT8();
	if (0x80&this.regA) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeCB80=function(){
	//RES   0,B
	this.setT8();
	this.loadB(0xFE&this.regB);
};
z80.codeCB81=function(){
	//RES   0,C
	this.setT8();
	this.loadC(0xFE&this.regC);
};
z80.codeCB82=function(){
	//RES   0,D
	this.setT8();
	this.loadD(0xFE&this.regD);
};
z80.codeCB83=function(){
	//RES   0,E
	this.setT8();
	this.loadE(0xFE&this.regE);
};
z80.codeCB84=function(){
	//RES   0,H
	this.setT8();
	this.loadH(0xFE&this.regH);
};
z80.codeCB85=function(){
	//RES   0,L
	this.setT8();
	this.loadL(0xFE&this.regL);
};
z80.codeCB86=function(){
	//RES   0,(HL)
	this.setT15();
	memory.write(this.regHL,0xFE&memory.read(this.regHL));
};
z80.codeCB87=function(){
	//RES   0,A
	this.setT8();
	this.loadA(0xFE&this.regA);
};
z80.codeCB88=function(){
	//RES   1,B
	this.setT8();
	this.loadB(0xFD&this.regB);
};
z80.codeCB89=function(){
	//RES   1,C
	this.setT8();
	this.loadC(0xFD&this.regC);
};
z80.codeCB8A=function(){
	//RES   1,D
	this.setT8();
	this.loadD(0xFD&this.regD);
};
z80.codeCB8B=function(){
	//RES   1,E
	this.setT8();
	this.loadE(0xFD&this.regE);
};
z80.codeCB8C=function(){
	//RES   1,H
	this.setT8();
	this.loadH(0xFD&this.regH);
};
z80.codeCB8D=function(){
	//RES   1,L
	this.setT8();
	this.loadL(0xFD&this.regL);
};
z80.codeCB8E=function(){
	//RES   1,(HL)
	this.setT15();
	memory.write(this.regHL,0xFD&memory.read(this.regHL));
};
z80.codeCB8F=function(){
	//RES   1,A
	this.setT8();
	this.loadA(0xFD&this.regA);
};
z80.codeCB90=function(){
	//RES   2,B
	this.setT8();
	this.loadB(0xFB&this.regB);
};
z80.codeCB91=function(){
	//RES   2,C
	this.setT8();
	this.loadC(0xFB&this.regC);
};
z80.codeCB92=function(){
	//RES   2,D
	this.setT8();
	this.loadD(0xFB&this.regD);
};
z80.codeCB93=function(){
	//RES   2,E
	this.setT8();
	this.loadE(0xFB&this.regE);
};
z80.codeCB94=function(){
	//RES   2,H
	this.setT8();
	this.loadH(0xFB&this.regH);
};
z80.codeCB95=function(){
	//RES   2,L
	this.setT8();
	this.loadL(0xFB&this.regL);
};
z80.codeCB96=function(){
	//RES   2,(HL)
	this.setT15();
	memory.write(this.regHL,0xFB&memory.read(this.regHL));
};
z80.codeCB97=function(){
	//RES   2,A
	this.setT8();
	this.loadA(0xFB&this.regA);
};
z80.codeCB98=function(){
	//RES   3,B
	this.setT8();
	this.loadB(0xF7&this.regB);
};
z80.codeCB99=function(){
	//RES   3,C
	this.setT8();
	this.loadC(0xF7&this.regC);
};
z80.codeCB9A=function(){
	//RES   3,D
	this.setT8();
	this.loadD(0xF7&this.regD);
};
z80.codeCB9B=function(){
	//RES   3,E
	this.setT8();
	this.loadE(0xF7&this.regE);
};
z80.codeCB9C=function(){
	//RES   3,H
	this.setT8();
	this.loadH(0xF7&this.regH);
};
z80.codeCB9D=function(){
	//RES   3,L
	this.setT8();
	this.loadL(0xF7&this.regL);
};
z80.codeCB9E=function(){
	//RES   3,(HL)
	this.setT15();
	memory.write(this.regHL,0xF7&memory.read(this.regHL));
};
z80.codeCB9F=function(){
	//RES   3,A
	this.setT8();
	this.loadA(0xF7&this.regA);
};
z80.codeCBA0=function(){
	//RES   4,B
	this.setT8();
	this.loadB(0xEF&this.regB);
};
z80.codeCBA1=function(){
	//RES   4,C
	this.setT8();
	this.loadC(0xEF&this.regC);
};
z80.codeCBA2=function(){
	//RES   4,D
	this.setT8();
	this.loadD(0xEF&this.regD);
};
z80.codeCBA3=function(){
	//RES   4,E
	this.setT8();
	this.loadE(0xEF&this.regE);
};
z80.codeCBA4=function(){
	//RES   4,H
	this.setT8();
	this.loadH(0xEF&this.regH);
};
z80.codeCBA5=function(){
	//RES   4,L
	this.setT8();
	this.loadL(0xEF&this.regL);
};
z80.codeCBA6=function(){
	//RES   4,(HL)
	this.setT15();
	memory.write(this.regHL,0xEF&memory.read(this.regHL));
};
z80.codeCBA7=function(){
	//RES   4,A
	this.setT8();
	this.loadA(0xEF&this.regA);
};
z80.codeCBA8=function(){
	//RES   5,B
	this.setT8();
	this.loadB(0xDF&this.regB);
};
z80.codeCBA9=function(){
	//RES   5,C
	this.setT8();
	this.loadC(0xDF&this.regC);
};
z80.codeCBAA=function(){
	//RES   5,D
	this.setT8();
	this.loadD(0xDF&this.regD);
};
z80.codeCBAB=function(){
	//RES   5,E
	this.setT8();
	this.loadE(0xDF&this.regE);
};
z80.codeCBAC=function(){
	//RES   5,H
	this.setT8();
	this.loadH(0xDF&this.regH);
};
z80.codeCBAD=function(){
	//RES   5,L
	this.setT8();
	this.loadL(0xDF&this.regL);
};
z80.codeCBAE=function(){
	//RES   5,(HL)
	this.setT15();
	memory.write(this.regHL,0xDF&memory.read(this.regHL));
};
z80.codeCBAF=function(){
	//RES   5,A
	this.setT8();
	this.loadA(0xDF&this.regA);
};
z80.codeCBB0=function(){
	//RES   6,B
	this.setT8();
	this.loadB(0xBF&this.regB);
};
z80.codeCBB1=function(){
	//RES   6,C
	this.setT8();
	this.loadC(0xBF&this.regC);
};
z80.codeCBB2=function(){
	//RES   6,D
	this.setT8();
	this.loadD(0xBF&this.regD);
};
z80.codeCBB3=function(){
	//RES   6,E
	this.setT8();
	this.loadE(0xBF&this.regE);
};
z80.codeCBB4=function(){
	//RES   6,H
	this.setT8();
	this.loadH(0xBF&this.regH);
};
z80.codeCBB5=function(){
	//RES   6,L
	this.setT8();
	this.loadL(0xBF&this.regL);
};
z80.codeCBB6=function(){
	//RES   6,(HL)
	this.setT15();
	memory.write(this.regHL,0xBF&memory.read(this.regHL));
};
z80.codeCBB7=function(){
	//RES   6,A
	this.setT8();
	this.loadA(0xBF&this.regA);
};
z80.codeCBB8=function(){
	//RES   7,B
	this.setT8();
	this.loadB(0x7F&this.regB);
};
z80.codeCBB9=function(){
	//RES   7,C
	this.setT8();
	this.loadC(0x7F&this.regC);
};
z80.codeCBBA=function(){
	//RES   7,D
	this.setT8();
	this.loadD(0x7F&this.regD);
};
z80.codeCBBB=function(){
	//RES   7,E
	this.setT8();
	this.loadE(0x7F&this.regE);
};
z80.codeCBBC=function(){
	//RES   7,H
	this.setT8();
	this.loadH(0x7F&this.regH);
};
z80.codeCBBD=function(){
	//RES   7,L
	this.setT8();
	this.loadL(0x7F&this.regL);
};
z80.codeCBBE=function(){
	//RES   7,(HL)
	this.setT15();
	memory.write(this.regHL,0x7F&memory.read(this.regHL));
};
z80.codeCBBF=function(){
	//RES   7,A
	this.setT8();
	this.loadA(0x7F&this.regA);
};
z80.codeCBC0=function(){
	//SET   0,B
	this.setT8();
	this.loadB(0x01|this.regB);
};
z80.codeCBC1=function(){
	//SET   0,C
	this.setT8();
	this.loadC(0x01|this.regC);
};
z80.codeCBC2=function(){
	//SET   0,D
	this.setT8();
	this.loadD(0x01|this.regD);
};
z80.codeCBC3=function(){
	//SET   0,E
	this.setT8();
	this.loadE(0x01|this.regE);
};
z80.codeCBC4=function(){
	//SET   0,H
	this.setT8();
	this.loadH(0x01|this.regH);
};
z80.codeCBC5=function(){
	//SET   0,L
	this.setT8();
	this.loadL(0x01|this.regL);
};
z80.codeCBC6=function(){
	//SET   0,(HL)
	this.setT15();
	memory.write(this.regHL,0x01|memory.read(this.regHL));
};
z80.codeCBC7=function(){
	//SET   0,A
	this.setT8();
	this.loadA(0x01|this.regA);
};
z80.codeCBC8=function(){
	//SET   1,B
	this.setT8();
	this.loadB(0x02|this.regB);
};
z80.codeCBC9=function(){
	//SET   1,C
	this.setT8();
	this.loadC(0x02|this.regC);
};
z80.codeCBCA=function(){
	//SET   1,D
	this.setT8();
	this.loadD(0x02|this.regD);
};
z80.codeCBCB=function(){
	//SET   1,E
	this.setT8();
	this.loadE(0x02|this.regE);
};
z80.codeCBCC=function(){
	//SET   1,H
	this.setT8();
	this.loadH(0x02|this.regH);
};
z80.codeCBCD=function(){
	//SET   1,L
	this.setT8();
	this.loadL(0x02|this.regL);
};
z80.codeCBCE=function(){
	//SET   1,(HL)
	this.setT15();
	memory.write(this.regHL,0x02|memory.read(this.regHL));
};
z80.codeCBCF=function(){
	//SET   1,A
	this.setT8();
	this.loadA(0x02|this.regA);
};
z80.codeCBD0=function(){
	//SET   2,B
	this.setT8();
	this.loadB(0x04|this.regB);
};
z80.codeCBD1=function(){
	//SET   2,C
	this.setT8();
	this.loadC(0x04|this.regC);
};
z80.codeCBD2=function(){
	//SET   2,D
	this.setT8();
	this.loadD(0x04|this.regD);
};
z80.codeCBD3=function(){
	//SET   2,E
	this.setT8();
	this.loadE(0x04|this.regE);
};
z80.codeCBD4=function(){
	//SET   2,H
	this.setT8();
	this.loadH(0x04|this.regH);
};
z80.codeCBD5=function(){
	//SET   2,L
	this.setT8();
	this.loadL(0x04|this.regL);
};
z80.codeCBD6=function(){
	//SET   2,(HL)
	this.setT15();
	memory.write(this.regHL,0x04|memory.read(this.regHL));
};
z80.codeCBD7=function(){
	//SET   2,A
	this.setT8();
	this.loadA(0x04|this.regA);
};
z80.codeCBD8=function(){
	//SET   3,B
	this.setT8();
	this.loadB(0x08|this.regB);
};
z80.codeCBD9=function(){
	//SET   3,C
	this.setT8();
	this.loadC(0x08|this.regC);
};
z80.codeCBDA=function(){
	//SET   3,D
	this.setT8();
	this.loadD(0x08|this.regD);
};
z80.codeCBDB=function(){
	//SET   3,E
	this.setT8();
	this.loadE(0x08|this.regE);
};
z80.codeCBDC=function(){
	//SET   3,H
	this.setT8();
	this.loadH(0x08|this.regH);
};
z80.codeCBDD=function(){
	//SET   3,L
	this.setT8();
	this.loadL(0x08|this.regL);
};
z80.codeCBDE=function(){
	//SET   3,(HL)
	this.setT15();
	memory.write(this.regHL,0x08|memory.read(this.regHL));
};
z80.codeCBDF=function(){
	//SET   3,A
	this.setT8();
	this.loadA(0x08|this.regA);
};
z80.codeCBE0=function(){
	//SET   4,B
	this.setT8();
	this.loadB(0x10|this.regB);
};
z80.codeCBE1=function(){
	//SET   4,C
	this.setT8();
	this.loadC(0x10|this.regC);
};
z80.codeCBE2=function(){
	//SET   4,D
	this.setT8();
	this.loadD(0x10|this.regD);
};
z80.codeCBE3=function(){
	//SET   4,E
	this.setT8();
	this.loadE(0x10|this.regE);
};
z80.codeCBE4=function(){
	//SET   4,H
	this.setT8();
	this.loadH(0x10|this.regH);
};
z80.codeCBE5=function(){
	//SET   4,L
	this.setT8();
	this.loadL(0x10|this.regL);
};
z80.codeCBE6=function(){
	//SET   4,(HL)
	this.setT15();
	memory.write(this.regHL,0x10|memory.read(this.regHL));
};
z80.codeCBE7=function(){
	//SET   4,A
	this.setT8();
	this.loadA(0x10|this.regA);
};
z80.codeCBE8=function(){
	//SET   5,B
	this.setT8();
	this.loadB(0x20|this.regB);
};
z80.codeCBE9=function(){
	//SET   5,C
	this.setT8();
	this.loadC(0x20|this.regC);
};
z80.codeCBEA=function(){
	//SET   5,D
	this.setT8();
	this.loadD(0x20|this.regD);
};
z80.codeCBEB=function(){
	//SET   5,E
	this.setT8();
	this.loadE(0x20|this.regE);
};
z80.codeCBEC=function(){
	//SET   5,H
	this.setT8();
	this.loadH(0x20|this.regH);
};
z80.codeCBED=function(){
	//SET   5,L
	this.setT8();
	this.loadL(0x20|this.regL);
};
z80.codeCBEE=function(){
	//SET   5,(HL)
	this.setT15();
	memory.write(this.regHL,0x20|memory.read(this.regHL));
};
z80.codeCBEF=function(){
	//SET   5,A
	this.setT8();
	this.loadA(0x20|this.regA);
};
z80.codeCBF0=function(){
	//SET   6,B
	this.setT8();
	this.loadB(0x40|this.regB);
};
z80.codeCBF1=function(){
	//SET   6,C
	this.setT8();
	this.loadC(0x40|this.regC);
};
z80.codeCBF2=function(){
	//SET   6,D
	this.setT8();
	this.loadD(0x40|this.regD);
};
z80.codeCBF3=function(){
	//SET   6,E
	this.setT8();
	this.loadE(0x40|this.regE);
};
z80.codeCBF4=function(){
	//SET   6,H
	this.setT8();
	this.loadH(0x40|this.regH);
};
z80.codeCBF5=function(){
	//SET   6,L
	this.setT8();
	this.loadL(0x40|this.regL);
};
z80.codeCBF6=function(){
	//SET   6,(HL)
	this.setT15();
	memory.write(this.regHL,0x40|memory.read(this.regHL));
};
z80.codeCBF7=function(){
	//SET   6,A
	this.setT8();
	this.loadA(0x40|this.regA);
};
z80.codeCBF8=function(){
	//SET   7,B
	this.setT8();
	this.loadB(0x80|this.regB);
};
z80.codeCBF9=function(){
	//SET   7,C
	this.setT8();
	this.loadC(0x80|this.regC);
};
z80.codeCBFA=function(){
	//SET   7,D
	this.setT8();
	this.loadD(0x80|this.regD);
};
z80.codeCBFB=function(){
	//SET   7,E
	this.setT8();
	this.loadE(0x80|this.regE);
};
z80.codeCBFC=function(){
	//SET   7,H
	this.setT8();
	this.loadH(0x80|this.regH);
};
z80.codeCBFD=function(){
	//SET   7,L
	this.setT8();
	this.loadL(0x80|this.regL);
};
z80.codeCBFE=function(){
	//SET   7,(HL)
	this.setT15();
	memory.write(this.regHL,0x80|memory.read(this.regHL));
};
z80.codeCBFF=function(){
	//SET   7,A
	this.setT8();
	this.loadA(0x80|this.regA);
};
z80.codeDD09=function(){
	//ADD   IX,BC
/*
S is not affected
Z is not affected
H is set if carry out of bit 11; reset otherwise
P/V is not affected
N is reset
C is set if carry from bit 15; reset otherwise
*/
	this.setT15();
	var i32=this.regIX+this.regBC;
	var i16=(this.regIX&0x0FFF)+(this.regBC&0x0FFF);
	this.loadIX(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeDD19=function(){
	//ADD   IX,DE
	this.setT15();
	var i32=this.regIX+this.regDE;
	var i16=(this.regIX&0x0FFF)+(this.regDE&0x0FFF);
	this.loadIX(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeDD21=function(){
	//LD    IX,nn
	this.setT14();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadIX(i16);
};
z80.codeDD22=function(){
	//LD    (nn),IX
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regIXl);
	memory.write(i16+1,this.regIXh);
};
z80.codeDD23=function(){
	//INC   IX
	this.setT10();
	this.loadIX(this.regIX+1);
};
z80.codeDD29=function(){
	//ADD   IX,IX
	this.setT15();
	var i32=this.regIX<<1;
	var i16=(this.regIX&0x0FFF)<<1;
	this.loadIX(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeDD2A=function(){
	//LD    IX,(nn)
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadIXl(memory.read(i16));
	this.loadIXh(memory.read(i16+1));
};
z80.codeDD2B=function(){
	//DEC   IX
	this.setT10();
	this.loadIX(this.regIX-1);
};
z80.codeDD34=function(){
	//INC   (IX+d)
	this.setT23();
	var i16=this.regIX+this.getCodeIndex();
	var i8=memory.read(i16)+1;
	memory.write(i16,i8);
	this.flag8inc(i8);
};
z80.codeDD35=function(){
	//DEC   (IX+D)
	this.setT23();
	var i16=this.regIX+this.getCodeIndex();
	var i8=memory.read(i16)-1;
	memory.write(i16,i8);
	this.flag8dec(i8);
};
z80.codeDD36=function(){
	//LD    (IX+d),n
	this.setT19();
	var i16=this.regIX+this.getCodeIndex();
	memory.write(i16,this.getCode());
};
z80.codeDD39=function(){
	//ADD   IX,SP
	this.setT15();
	var i32=this.regIX+this.regSP;
	var i16=(this.regIX&0x0FFF)+(this.regSP&0x0FFF);
	this.loadIX(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeDD46=function(){
	//LD    B,(IX+d)
	this.setT19();
	this.loadB(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD4E=function(){
	//LD    C,(IX+d)
	this.setT19();
	this.loadC(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD56=function(){
	//LD    D,(IX+d)
	this.setT19();
	this.loadD(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD5E=function(){
	//LD    E,(IX+d)
	this.setT19();
	this.loadE(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD66=function(){
	//LD    H,(IX+d)
	this.setT19();
	this.loadH(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD6E=function(){
	//LD    L,(IX+d)
	this.setT19();
	this.loadL(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD70=function(){
	//LD    (IX+d),B
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regB);
};
z80.codeDD71=function(){
	//LD    (IX+d),C
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regC);
};
z80.codeDD72=function(){
	//LD    (IX+d),D
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regD);
};
z80.codeDD73=function(){
	//LD    (IX+d),E
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regE);
};
z80.codeDD74=function(){
	//LD    (IX+d),H
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regH);
};
z80.codeDD75=function(){
	//LD    (IX+d),L
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regL);
};
z80.codeDD77=function(){
	//LD    (IX+d),A
	this.setT19();
	memory.write(this.regIX+this.getCodeIndex(),this.regA);
};
z80.codeDD7E=function(){
	//LD    A,(IX+d)
	this.setT19();
	this.loadA(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD86=function(){
	//ADD   A,(IX+d)
	this.setT19();
	this.z80ADD(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD8E=function(){
	//ADC   A,(IX+d)
	this.setT19();
	this.z80ADC(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD96=function(){
	//SUB   A,(IX+d)
	this.setT19();
	this.z80SUB(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDD9E=function(){
	//SBC   A,(IX+d)
	this.setT19();
	this.z80SBC(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDDA6=function(){
	//AND   (IX+d)
	this.setT19();
	this.z80AND(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDDAE=function(){
	//XOR   (IX+d)
	this.setT19();
	this.z80XOR(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDDB6=function(){
	//OR    (IX+d)
	this.setT19();
	this.z80OR(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDDBE=function(){
	//CP    (IX+d)
	this.setT19();
	this.z80CP(memory.read(this.regIX+this.getCodeIndex()));
};
z80.codeDDCB06=function(i16){
	//RLC   (IX+d)
	this.setT23();
	memory.write(i16,this.z80RLC(memory.read(i16)));
};
z80.codeDDCB0E=function(i16){
	//RRC   (IX+d)
	this.setT23();
	memory.write(i16,this.z80RRC(memory.read(i16)));
};
z80.codeDDCB16=function(i16){
	//RL    (IX+d)
	this.setT23();
	memory.write(i16,this.z80RL(memory.read(i16)));
};
z80.codeDDCB1E=function(i16){
	//RR    (IX+d)
	this.setT23();
	memory.write(i16,this.z80RR(memory.read(i16)));
};
z80.codeDDCB26=function(i16){
	//SLA   (IX+d)
	this.setT23();
	memory.write(i16,this.z80SLA(memory.read(i16)));
};
z80.codeDDCB2E=function(i16){
	//SRA   (IX+d)
	this.setT23();
	memory.write(i16,this.z80SRA(memory.read(i16)));
};
z80.codeDDCB3E=function(i16){
	//SRL   (IX+d)
	this.setT23();
	memory.write(i16,this.z80SRL(memory.read(i16)));
};
z80.codeDDCB46=function(i16){
	//BIT   0,(IX+d)
	this.setT20();
	if (0x01&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB4E=function(i16){
	//BIT   1,(IX+d)
	this.setT20();
	if (0x02&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB56=function(i16){
	//BIT   2,(IX+d)
	this.setT20();
	if (0x04&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB5E=function(i16){
	//BIT   3,(IX+d)
	this.setT20();
	if (0x08&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB66=function(i16){
	//BIT   4,(IX+d)
	this.setT20();
	if (0x10&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB6E=function(i16){
	//BIT   5,(IX+d)
	this.setT20();
	if (0x20&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB76=function(i16){
	//BIT   6,(IX+d)
	this.setT20();
	if (0x40&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB7E=function(i16){
	//BIT   7,(IX+d)
	this.setT20();
	if (0x80&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeDDCB86=function(i16){
	//RES   0,(IX+d)
	this.setT23();
	memory.write(i16,0xFE&memory.read(i16));
};
z80.codeDDCB8E=function(i16){
	//RES   1,(IX+d)
	this.setT23();
	memory.write(i16,0xFD&memory.read(i16));
};
z80.codeDDCB96=function(i16){
	//RES   2,(IX+d)
	this.setT23();
	memory.write(i16,0xFB&memory.read(i16));
};
z80.codeDDCB9E=function(i16){
	//RES   3,(IX+d)
	this.setT23();
	memory.write(i16,0xF7&memory.read(i16));
};
z80.codeDDCBA6=function(i16){
	//RES   4,(IX+d)
	this.setT23();
	memory.write(i16,0xEF&memory.read(i16));
};
z80.codeDDCBAE=function(i16){
	//RES   5,(IX+d)
	this.setT23();
	memory.write(i16,0xDF&memory.read(i16));
};
z80.codeDDCBB6=function(i16){
	//RES   6,(IX+d)
	this.setT23();
	memory.write(i16,0xBF&memory.read(i16));
};
z80.codeDDCBBE=function(i16){
	//RES   7,(IX+d)
	this.setT23();
	memory.write(i16,0x7F&memory.read(i16));
};
z80.codeDDCBC6=function(i16){
	//SET   0,(IX+d)
	this.setT23();
	memory.write(i16,0x01|memory.read(i16));
};
z80.codeDDCBCE=function(i16){
	//SET   1,(IX+d)
	this.setT23();
	memory.write(i16,0x02|memory.read(i16));
};
z80.codeDDCBD6=function(i16){
	//SET   2,(IX+d)
	this.setT23();
	memory.write(i16,0x04|memory.read(i16));
};
z80.codeDDCBDE=function(i16){
	//SET   3,(IX+d)
	this.setT23();
	memory.write(i16,0x08|memory.read(i16));
};
z80.codeDDCBE6=function(i16){
	//SET   4,(IX+d)
	this.setT23();
	memory.write(i16,0x10|memory.read(i16));
};
z80.codeDDCBEE=function(i16){
	//SET   5,(IX+d)
	this.setT23();
	memory.write(i16,0x20|memory.read(i16));
};
z80.codeDDCBF6=function(i16){
	//SET   6,(IX+d)
	this.setT23();
	memory.write(i16,0x40|memory.read(i16));
};
z80.codeDDCBFE=function(i16){
	//SET   7,(IX+d)
	this.setT23();
	memory.write(i16,0x80|memory.read(i16));
};
z80.codeDDE1=function(){
	//POP   IX
	this.setT14();
	this.loadIXl(memory.read(this.regSP));
	this.loadIXh(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeDDE3=function(){
	//DD E3        EX    (SP),IX
	this.setT23();
	var i8=memory.read(this.regSP);
	var i82=memory.read(this.regSP+1);
	memory.write(this.regSP,this.regIXl);
	memory.write(this.regSP+1,this.regIXh);
	this.loadIXl(i8);
	this.loadIXh(i82);
};
z80.codeDDE5=function(){
	//PUSH   IX
	this.setT15();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regIXl);
	memory.write(this.regSP+1,this.regIXh);
};
z80.codeDDE9=function(){
	//JP    (IX)
	this.setT8();
	this.loadPC(this.regIX);
};
z80.codeDDF9=function(){
	//LD    SP,IX
	this.setT10();
	this.loadSP(this.regIX);
};
z80.codeED40=function(){
	//IN    B,(C)
	this.setT12();
	this.loadB(io.read(this.regC, this.regB));
};
z80.codeED41=function(){
	//OUT   (C),B
	this.setT12();
	io.write(this.regC, this.regB, this.regB);
};
z80.codeED42=function(){
	//SBC   HL,BC
	this.setT15();
	this.z80SBC16(this.regBC);
};
z80.codeED43=function(){
	//LD    (nn),BC
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regC);
	memory.write(i16+1,this.regB);
};
z80.codeED44=function(){
	//NEG
/*
A=0-A
S is set if result is negative; reset otherwise
Z is set if result is 0; reset otherwise
H is set if borrow from bit 4; reset otherwise
P/V is set if Accumulator was 80H before operation; reset otherwise
N is set
C is set if Accumulator was not 00H before operation; reset otherwise
*/
	this.setT8();
	if (0x80==this.regA) this.setPflag();
	else this.clearPflag();
	var i8=0-this.regA;
	if ((i8^this.regA)&0x10) this.setHflag();
	else this.clearHflag();
	this.loadA(i8);
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8) {
		this.clearZflag();
		this.setCflag();
	} else {
		this.setZflag();
		this.clearCflag();
	}
};
z80.codeED45=function(){
	//RETN
	this.setT14();
	var i8=memory.read(this.regSP);
	var i16=memory.read(this.regSP+1)<<8;
	i16|=i8;
	this.loadPC(i16);
	this.loadSP(this.regSP+2);
	this.loadIFF1(this.flagIFF2);
};
z80.codeED46=function(){
	//IM    0
	this.setT8();
	this.loadIM(0);
};
z80.codeED47=function(){
	//LD    I,A
	this.setT9();
	this.loadI(this.regA);
};
z80.codeED48=function(){
	//IN    C,(C)
	this.setT12();
	this.loadC(io.read(this.regC, this.regB));
};
z80.codeED49=function(){
	//OUT   (C),C
	this.setT12();
	io.write(this.regC, this.regB, this.regC);
};
z80.codeED4A=function(){
	//ADC   HL,BC
	this.setT15();
	this.z80ADC16(this.regBC);
};
z80.codeED4B=function(){
	//LD    BC,(nn)
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadC(memory.read(i16));
	this.loadB(memory.read(i16+1));
};
z80.codeED4D=function(){
	//RETI
	this.setT14();
	var i8=memory.read(this.regSP);
	var i16=memory.read(this.regSP+1)<<8;
	i16|=i8;
	this.loadPC(i16);
	this.loadSP(this.regSP+2);
};
z80.codeED4F=function(){
	//LD    R,A
	this.setT9();
	this.loadR(this.regA);
};
z80.codeED50=function(){
	//IN    D,(C)
	this.setT12();
	this.loadD(io.read(this.regC, this.regB));
};
z80.codeED51=function(){
	//OUT   (C),D
	this.setT12();
	io.write(this.regC, this.regB, this.regD);
};
z80.codeED52=function(){
	//SBC   HL,DE
	this.setT15();
	this.z80SBC16(this.regDE);
};
z80.codeED53=function(){
	//LD    (nn),DE
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regE);
	memory.write(i16+1,this.regD);
};
z80.codeED56=function(){
	//IM    1
	this.setT8();
	this.loadIM(1);
};
z80.codeED57=function(){
	//ED 57   LD    A,I
	this.setT9();
	this.loadA(this.regI);
	if (this.flagIFF2) this.setPflag();
	else this.clearPflag();
};
z80.codeED58=function(){
	//IN    E,(C)
	this.setT12();
	this.loadE(io.read(this.regC, this.regB));
};
z80.codeED59=function(){
	//OUT   (C),E
	this.setT12();
	io.write(this.regC, this.regB, this.regE);
};
z80.codeED5A=function(){
	//ADC   HL,DE
	this.setT15();
	this.z80ADC16(this.regDE);
};
z80.codeED5B=function(){
	//LD    DE,(nn)
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadE(memory.read(i16));
	this.loadD(memory.read(i16+1));
};
z80.codeED5E=function(){
	//IM    2
	this.setT8();
	this.loadIM(2);
};
z80.codeED5F=function(){
	//ED 5F   LD    A,R
	this.setT9();
	this.loadA(this.regR);
	if (this.flagIFF2) this.setPflag();
	else this.clearPflag();
};
z80.codeED60=function(){
	//IN    H,(C)
	this.setT12();
	this.loadH(io.read(this.regC, this.regB));
};
z80.codeED61=function(){
	//OUT   (C),H
	this.setT12();
	io.write(this.regC, this.regB, this.regH);
};
z80.codeED62=function(){
	//SBC   HL,HL
	this.setT15();
	this.z80SBC16(this.regHL);
};
z80.codeED63=function(){
	//LD (nn),HL
	var i16;
	i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regL);
	memory.write(i16+1,this.regH);
}
z80.codeED67=function(){
	//RRD
/*
S is set if Accumulator is negative after operation; reset otherwise
Z is set if Accumulator is zero after operation; reset otherwise
H is reset
P/V is set if parity of Accumulator is even after operation; reset otherwise
N is reset
C is not affected
*/
	var i8=memory.read(this.regHL);
	memory.write(this.regHL,(i8>>4)|(this.regA<<4));
	this.loadA(this.regA&0xf0 | i8&0x0f);
	if (this.regA&0x80) this.setSflag();
	else this.clearSflag();
	if (this.regA) this.clearZflag();
	else this.setZflag();
	this.clearHflag();
	this.clearNflag();
	this.setZ80Parity(this.regA);
};
z80.codeED68=function(){
	//IN    L,(C)
	this.setT12();
	this.loadL(io.read(this.regC, this.regB));
};
z80.codeED69=function(){
	//OUT   (C),L
	this.setT12();
	io.write(this.regC, this.regB, this.regL);
};
z80.codeED6A=function(){
	//ADC   HL,HL
	this.setT15();
	this.z80ADC16(this.regHL);
};
z80.codeED6B=function(){
	//LD HL,(nn)
	var i16;
	i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadL(memory.read(i16));
	this.loadH(memory.read(i16+1));
}
z80.codeED6F=function(){
	//RLD
/*
S is set if Accumulator is negative after operation; reset otherwise
Z is set if Accumulator is zero after operation; reset otherwise
H is reset
P/V is set if parity of Accumulator is even after operation; reset otherwise
N is reset
C is not affected
*/
	var i8=memory.read(this.regHL);
	memory.write(this.regHL,(i8<<4)|(this.regA&0x0f));
	this.loadA(this.regA&0xf0 | (i8>>4));
	if (this.regA&0x80) this.setSflag();
	else this.clearSflag();
	if (this.regA) this.clearZflag();
	else this.setZflag();
	this.clearHflag();
	this.clearNflag();
	this.setZ80Parity(this.regA);
};
z80.codeED72=function(){
	//SBC   HL,SP
	this.setT15();
	this.z80SBC16(this.regSP);
};
z80.codeED73=function(){
	//LD    (nn),SP
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regSPl);
	memory.write(i16+1,this.regSPh);
};
z80.codeED78=function(){
	//IN    A,(C)
	this.setT12();
	this.loadA(io.read(this.regC, this.regB));
};
z80.codeED79=function(){
	//OUT   (c),A
	this.setT12();
	io.write(this.regC, this.regB, this.regA);
};
z80.codeED7A=function(){
	//ADC   HL,SP
	this.setT15();
	this.z80ADC16(this.regSP);
};
z80.codeED7B=function(){
	//LD    SP,(nn)
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadSPl(memory.read(i16));
	this.loadSPh(memory.read(i16+1));
};// Checked until this line.
z80.codeEDA0=function(){
	//LDI
	//(DE) © (HL), DE © DE + 1, HL © HL + 1, BC © BC -1
/*
S is not affected
Z is not affected
H is reset
P/V is set if BC -1 ‚ 0; reset otherwise
N is reset
C is not affected
*/
	this.setT16();
	memory.write(this.regDE,memory.read(this.regHL));
	this.loadDE(this.regDE+1);
	this.loadHL(this.regHL+1);
	this.loadBC(this.regBC-1);
	this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.clearNflag();
};
z80.codeEDA1=function(){
	//CPI
	//A- (HL), HL © HL +1, BC © BC -1
/*
S is set if result is negative; reset otherwise
Z is set if A is (HL); reset otherwise
H is set if borrow from bit 4; reset otherwise
P/V is set if BC -1 is not 0; reset otherwise
N is set
C is not affected
*/
	this.setT16();
	var i8=memory.read(this.regHL);
	var i82=(0x0F&this.regA)-(0x0F&i8);
	i8=this.regA-i8;
	this.loadHL(this.regHL+1);
	this.loadBC(this.regBC-1);
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8) this.clearZflag();
	else this.setZflag();
	if (0x80&i82) this.setHflag();
	else this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.setNflag();
};
z80.codeEDA2=function(){
	//INI
	//(HL) © (C), B © B -1, HL © HL + 1
/*
S is unknown
Z is set if B?1 = 0, reset otherwise
H is unknown
P/V is unknown
N is set
C is not affected
*/
	this.setT16();
	memory.write(this.regHL,io.read(this.regC,this.regB));
	this.loadHL(this.regHL+1);
	this.loadB(this.regB-1);
	if (this.regB) this.clearZflag();
	else this.setZflag();
	this.setNflag();
};
z80.codeEDA3=function(){
	//OUTI
	//(C) © (HL), B © B -1, HL © HL + 1
	this.setT16();
	io.write(this.regC,this.regB,memory.read(this.regHL));
	this.loadHL(this.regHL+1);
	this.loadB(this.regB-1);
	if (this.regB) this.clearZflag();
	else this.setZflag();
	this.setNflag();	
};
z80.codeEDA8=function(){
	//LDD
	//(DE) © (HL), DE © DE -1, HL © HL-1, BC © BC-1
	this.setT16();
	memory.write(this.regDE,memory.read(this.regHL));
	this.loadDE(this.regDE-1);
	this.loadHL(this.regHL-1);
	this.loadBC(this.regBC-1);
	this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.clearNflag();
};
z80.codeEDA9=function(){
	//CPD
	//A -(HL), HL © HL -1, BC © BC -1
	this.setT16();
	var i8=memory.read(this.regHL);
	var i82=(0x0F&this.regA)-(0x0F&i8);
	i8=this.regA-i8;
	this.loadHL(this.regHL-1);
	this.loadBC(this.regBC-1);
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8) this.clearZflag();
	else this.setZflag();
	if (0x80&i82) this.setHflag();
	else this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.setNflag();
};
z80.codeEDAA=function(){
	//IND
	//(HL) © (C), B © B -1, HL © HL -1
	this.setT16();
	memory.write(this.regHL,io.read(this.regC,this.regB));
	this.loadHL(this.regHL-1);
	this.loadB(this.regB-1);
	if (this.regB) this.clearZflag();
	else this.setZflag();
	this.setNflag();
};
z80.codeEDAB=function(){
	//OUTD
	//(C) © (HL), B © B -1, HL © HL -1
	this.setT16();
	io.write(this.regC,this.regB,memory.read(this.regHL));
	this.loadHL(this.regHL-1);
	this.loadB(this.regB-1);
	if (this.regB) this.clearZflag();
	else this.setZflag();
	this.setNflag();	
};
z80.codeEDB0=function(){
	//LDIR
	//(DE) © (HL), DE © DE + 1, HL © HL + 1, BC F? BC -1
/*
S is not affected
Z is not affected
H is reset
P/V is reset
N is reset
C is not affected
*/
	if (this.regBC==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	memory.write(this.regDE,memory.read(this.regHL));
	this.loadDE(this.regDE+1);
	this.loadHL(this.regHL+1);
	this.loadBC(this.regBC-1);
	this.clearHflag();
	this.clearPflag();
	this.clearNflag();
};
z80.codeEDB1=function(){
	//CPIR
	//A-(HL), HL © HL+1, BC © BC-1
/*
S is set if result is negative; reset otherwise
Z is set if A equals (HL); reset otherwise
H is set if borrow from bit 4; reset otherwise
P/V is set if BC -1 does not equal 0; reset otherwise
N is set
C is not affected
*/
	if (this.regBC==1 || this.regA==memory.read(this.regHL)) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	var i8=memory.read(this.regHL);
	var i82=(0x0F&this.regA)-(0x0F&i8);
	i8=this.regA-i8;
	this.loadHL(this.regHL+1);
	this.loadBC(this.regBC-1);
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8) this.clearZflag();
	else this.setZflag();
	if (0x80&i82) this.setHflag();
	else this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.setNflag();
}	
z80.codeEDB2=function(){
	//INIR
	//(HL) © (C), B © B -1, HL © HL +1
	if (this.regB==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	memory.write(this.regHL,io.read(this.regC,this.regB));
	this.loadHL(this.regHL+1);
	this.loadB(this.regB-1);
	this.setZflag();
	this.setNflag();
};
z80.codeEDB3=function(){
	//OTIR
	//(C) © (HL), B © B -1, HL © HL + 1
	if (this.regB==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	io.write(this.regC,this.regB,memory.read(this.regHL));
	this.loadHL(this.regHL+1);
	this.loadB(this.regB-1);
	this.setZflag();
	this.setNflag();	
};
z80.codeEDB8=function(){
	//LDDR
	if (this.regBC==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	memory.write(this.regDE,memory.read(this.regHL));
	this.loadDE(this.regDE-1);
	this.loadHL(this.regHL-1);
	this.loadBC(this.regBC-1);
	this.clearHflag();
	this.clearPflag();
	this.clearNflag();
};
z80.codeEDB9=function(){
	//CPDR
	if (this.regBC==1 || this.regA==memory.read(this.regHL)) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	var i8=memory.read(this.regHL);
	var i82=(0x0F&this.regA)-(0x0F&i8);
	i8=this.regA-i8;
	this.loadHL(this.regHL-1);
	this.loadBC(this.regBC-1);
	if (0x80&i8) this.setSflag();
	else this.clearSflag();
	if (i8) this.clearZflag();
	else this.setZflag();
	if (0x80&i82) this.setHflag();
	else this.clearHflag();
	if (this.regBC) this.setPflag();
	else this.clearPflag();
	this.setNflag();
};
z80.codeEDBA=function(){
	//INDR
	if (this.regB==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	memory.write(this.regHL,io.read(this.regC,this.regB));
	this.loadHL(this.regHL-1);
	this.loadB(this.regB-1);
	this.setZflag();
	this.setNflag();
};
z80.codeEDBB=function(){
	//OTDR
	if (this.regB==1) {
		this.setT16();
	} else {
		this.setT21();
		this.loadPC(this.regPC-2);
	}
	io.write(this.regC,this.regB,memory.read(this.regHL));
	this.loadHL(this.regHL-1);
	this.loadB(this.regB-1);
	this.setZflag();
	this.setNflag();	
};
z80.codeFD09=function(){
	//ADD   IY,BC
/*
S is not affected
Z is not affected
H is set if carry out of bit 11; reset otherwise
P/V is not affected
N is reset
C is set if carry from bit 15; reset otherwise
*/
	this.setT15();
	var i32=this.regIY+this.regBC;
	var i16=(this.regIY&0x0FFF)+(this.regBC&0x0FFF);
	this.loadIY(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeFD19=function(){
	//ADD   IY,DE
	this.setT15();
	var i32=this.regIY+this.regDE;
	var i16=(this.regIY&0x0FFF)+(this.regDE&0x0FFF);
	this.loadIY(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeFD21=function(){
	//LD    IY,nn
	this.setT14();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadIY(i16);
};
z80.codeFD22=function(){
	//LD    (nn),IY
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	memory.write(i16,this.regIYl);
	memory.write(i16+1,this.regIYh);
};
z80.codeFD23=function(){
	//INC   IY
	this.setT10();
	this.loadIY(this.regIY+1);
};
z80.codeFD29=function(){
	//ADD   IY,IY
	this.setT15();
	var i32=this.regIY<<1;
	var i16=(this.regIY&0x0FFF)<<1;
	this.loadIY(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeFD2A=function(){
	//LD    IY,(nn)
	this.setT20();
	var i16=this.getCode();
	i16|=this.getCode()<<8;
	this.loadIYl(memory.read(i16));
	this.loadIYh(memory.read(i16+1));
};
z80.codeFD2B=function(){
	//DEC   IY
	this.setT10();
	this.loadIY(this.regIY-1);
};
z80.codeFD34=function(){
	//INC   (IY+d)
	this.setT23();
	var i16=this.regIY+this.getCodeIndex();
	var i8=memory.read(i16)+1;
	memory.write(i16,i8);
	this.flag8inc(i8);
};
z80.codeFD35=function(){
	//DEC   (IY+D)
	this.setT23();
	var i16=this.regIY+this.getCodeIndex();
	var i8=memory.read(i16)-1;
	memory.write(i16,i8);
	this.flag8dec(i8);
};
z80.codeFD36=function(){
	//LD    (IY+d),n
	this.setT19();
	var i16=this.regIY+this.getCodeIndex();
	memory.write(i16,this.getCode());
};
z80.codeFD39=function(){
	//ADD   IY,SP
	this.setT15();
	var i32=this.regIY+this.regSP;
	var i16=(this.regIY&0x0FFF)+(this.regSP&0x0FFF);
	this.loadIY(i32);
	if (0xFFFF<i32) this.setCflag();
	else this.clearCflag();
	if (0x0FFF<i16) this.setHflag();
	else this.clearHflag();
	this.clearNflag();
};
z80.codeFD46=function(){
	//LD    B,(IY+d)
	this.setT19();
	this.loadB(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD4E=function(){
	//LD    C,(IY+d)
	this.setT19();
	this.loadC(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD56=function(){
	//LD    D,(IY+d)
	this.setT19();
	this.loadD(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD5E=function(){
	//LD    E,(IY+d)
	this.setT19();
	this.loadE(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD66=function(){
	//LD    H,(IY+d)
	this.setT19();
	this.loadH(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD6E=function(){
	//LD    L,(IY+d)
	this.setT19();
	this.loadL(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD70=function(){
	//LD    (IY+d),B
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regB);
};
z80.codeFD71=function(){
	//LD    (IY+d),C
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regC);
};
z80.codeFD72=function(){
	//LD    (IY+d),D
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regD);
};
z80.codeFD73=function(){
	//LD    (IY+d),E
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regE);
};
z80.codeFD74=function(){
	//LD    (IY+d),H
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regH);
};
z80.codeFD75=function(){
	//LD    (IY+d),L
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regL);
};
z80.codeFD77=function(){
	//LD    (IY+d),A
	this.setT19();
	memory.write(this.regIY+this.getCodeIndex(),this.regA);
};
z80.codeFD7E=function(){
	//LD    A,(IY+d)
	this.setT19();
	this.loadA(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD86=function(){
	//ADD   A,(IY+d)
	this.setT19();
	this.z80ADD(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD8E=function(){
	//ADC   A,(IY+d)
	this.setT19();
	this.z80ADC(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD96=function(){
	//SUB   A,(IY+d)
	this.setT19();
	this.z80SUB(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFD9E=function(){
	//SBC   A,(IY+d)
	this.setT19();
	this.z80SBC(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFDA6=function(){
	//AND   (IY+d)
	this.setT19();
	this.z80AND(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFDAE=function(){
	//XOR   (IY+d)
	this.setT19();
	this.z80XOR(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFDB6=function(){
	//OR    (IY+d)
	this.setT19();
	this.z80OR(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFDBE=function(){
	//CP    (IY+d)
	this.setT19();
	this.z80CP(memory.read(this.regIY+this.getCodeIndex()));
};
z80.codeFDCB06=function(i16){
	//RLC   (IY+d)
	this.setT23();
	memory.write(i16,this.z80RLC(memory.read(i16)));
};
z80.codeFDCB0E=function(i16){
	//RRC   (IY+d)
	this.setT23();
	memory.write(i16,this.z80RRC(memory.read(i16)));
};
z80.codeFDCB16=function(i16){
	//RL    (IY+d)
	this.setT23();
	memory.write(i16,this.z80RL(memory.read(i16)));
};
z80.codeFDCB1E=function(i16){
	//RR    (IY+d)
	this.setT23();
	memory.write(i16,this.z80RR(memory.read(i16)));
};
z80.codeFDCB26=function(i16){
	//SLA   (IY+d)
	this.setT23();
	memory.write(i16,this.z80SLA(memory.read(i16)));
};
z80.codeFDCB2E=function(i16){
	//SRA   (IY+d)
	this.setT23();
	memory.write(i16,this.z80SRA(memory.read(i16)));
};
z80.codeFDCB3E=function(i16){
	//SRL   (IY+d)
	this.setT23();
	memory.write(i16,this.z80SRL(memory.read(i16)));
};
z80.codeFDCB46=function(i16){
	//BIT   0,(IY+d)
	this.setT20();
	if (0x01&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB4E=function(i16){
	//BIT   1,(IY+d)
	this.setT20();
	if (0x02&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB56=function(i16){
	//BIT   2,(IY+d)
	this.setT20();
	if (0x04&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB5E=function(i16){
	//BIT   3,(IY+d)
	this.setT20();
	if (0x08&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB66=function(i16){
	//BIT   4,(IY+d)
	this.setT20();
	if (0x10&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB6E=function(i16){
	//BIT   5,(IY+d)
	this.setT20();
	if (0x20&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB76=function(i16){
	//BIT   6,(IY+d)
	this.setT20();
	if (0x40&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB7E=function(i16){
	//BIT   7,(IY+d)
	this.setT20();
	if (0x80&memory.read(i16)) this.clearZflag();
	else this.setZflag();
	this.setHflag();
	this.clearNflag();
};
z80.codeFDCB86=function(i16){
	//RES   0,(IY+d)
	this.setT23();
	memory.write(i16,0xFE&memory.read(i16));
};
z80.codeFDCB8E=function(i16){
	//RES   1,(IY+d)
	this.setT23();
	memory.write(i16,0xFD&memory.read(i16));
};
z80.codeFDCB96=function(i16){
	//RES   2,(IY+d)
	this.setT23();
	memory.write(i16,0xFB&memory.read(i16));
};
z80.codeFDCB9E=function(i16){
	//RES   3,(IY+d)
	this.setT23();
	memory.write(i16,0xF7&memory.read(i16));
};
z80.codeFDCBA6=function(i16){
	//RES   4,(IY+d)
	this.setT23();
	memory.write(i16,0xEF&memory.read(i16));
};
z80.codeFDCBAE=function(i16){
	//RES   5,(IY+d)
	this.setT23();
	memory.write(i16,0xDF&memory.read(i16));
};
z80.codeFDCBB6=function(i16){
	//RES   6,(IY+d)
	this.setT23();
	memory.write(i16,0xBF&memory.read(i16));
};
z80.codeFDCBBE=function(i16){
	//RES   7,(IY+d)
	this.setT23();
	memory.write(i16,0x7F&memory.read(i16));
};
z80.codeFDCBC6=function(i16){
	//SET   0,(IY+d)
	this.setT23();
	memory.write(i16,0x01|memory.read(i16));
};
z80.codeFDCBCE=function(i16){
	//SET   1,(IY+d)
	this.setT23();
	memory.write(i16,0x02|memory.read(i16));
};
z80.codeFDCBD6=function(i16){
	//SET   2,(IY+d)
	this.setT23();
	memory.write(i16,0x04|memory.read(i16));
};
z80.codeFDCBDE=function(i16){
	//SET   3,(IY+d)
	this.setT23();
	memory.write(i16,0x08|memory.read(i16));
};
z80.codeFDCBE6=function(i16){
	//SET   4,(IY+d)
	this.setT23();
	memory.write(i16,0x10|memory.read(i16));
};
z80.codeFDCBEE=function(i16){
	//SET   5,(IY+d)
	this.setT23();
	memory.write(i16,0x20|memory.read(i16));
};
z80.codeFDCBF6=function(i16){
	//SET   6,(IY+d)
	this.setT23();
	memory.write(i16,0x40|memory.read(i16));
};
z80.codeFDCBFE=function(i16){
	//SET   7,(IY+d)
	this.setT23();
	memory.write(i16,0x80|memory.read(i16));
};
z80.codeFDE1=function(){
	//POP   IY
	this.setT14();
	this.loadIYl(memory.read(this.regSP));
	this.loadIYh(memory.read(this.regSP+1));
	this.loadSP(this.regSP+2);
};
z80.codeFDE3=function(){
	//DD E3        EX    (SP),IY
	this.setT23();
	var i8=memory.read(this.regSP);
	var i82=memory.read(this.regSP+1);
	memory.write(this.regSP,this.regIYl);
	memory.write(this.regSP+1,this.regIYh);
	this.loadIYl(i8);
	this.loadIYh(i82);
};
z80.codeFDE5=function(){
	//PUSH   IY
	this.setT15();
	this.loadSP(this.regSP-2);
	memory.write(this.regSP,this.regIYl);
	memory.write(this.regSP+1,this.regIYh);
};
z80.codeFDE9=function(){
	//JP    (IY)
	this.setT8();
	this.loadPC(this.regIY);
};
z80.codeFDF9=function(){
	//LD    SP,IY
	this.setT10();
	this.loadSP(this.regIY);
}
z80.codeVector=new Array(256);
z80.codeCBVector=new Array(256);
z80.codeDDVector=new Array(256);
z80.codeEDVector=new Array(256);
z80.codeFDVector=new Array(256);
z80.codeDDCBVector=new Array(256);
z80.codeFDCBVector=new Array(256);
for (i=0;i<16;i++) {
	eval("z80.codeVector["+i+"]=function(){ z80.code0"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeCBVector["+i+"]=function(){ z80.codeCB0"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeDDVector["+i+"]=function(){ z80.codeDD0"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeEDVector["+i+"]=function(){ z80.codeED0"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeFDVector["+i+"]=function(){ z80.codeFD0"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeDDCBVector["+i+"]=function(i16){ z80.codeDDCB0"+i.toString(16).toUpperCase()+"(i16); };");
	eval("z80.codeFDCBVector["+i+"]=function(i16){ z80.codeFDCB0"+i.toString(16).toUpperCase()+"(i16); };");
}
for (i=16;i<256;i++) {
	eval("z80.codeVector["+i+"]=function(){ z80.code"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeCBVector["+i+"]=function(){ z80.codeCB"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeDDVector["+i+"]=function(){ z80.codeDD"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeEDVector["+i+"]=function(){ z80.codeED"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeFDVector["+i+"]=function(){ z80.codeFD"+i.toString(16).toUpperCase()+"(); };");
	eval("z80.codeDDCBVector["+i+"]=function(i16){ z80.codeDDCB"+i.toString(16).toUpperCase()+"(i16); };");
	eval("z80.codeFDCBVector["+i+"]=function(i16){ z80.codeFDCB"+i.toString(16).toUpperCase()+"(i16); };");
}
z80.exec=function(msec){
	var i,code;
	for (i=msec;0<i;i--) {
		while (this.clk<this.speed || this.step) {
			if (this.regPC==this.breakPoint) {
				this.breakPoint=-1;
				this.step=1;
				return;
			}
			this.m1=true;
			code=this.getCode();
			this.m1=false;
			this.codeVector[code]();
			if (this.irq) this.doInt();
			if (this.step) return;
			// Increment R register here
			this.loadR(this.regR+1);
		}
		this.clk-=this.speed;
		this.events();
	}
};
z80.codeCB=function(){
	// Increment R register here
	this.loadR(this.regR+1);
	try {
		this.codeCBVector[this.getCode()]();
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
z80.codeDD=function(){
	// Increment R register here
	this.loadR(this.regR+1);
	try {
		this.codeDDVector[this.getCode()]();
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
z80.codeED=function(){
	// Increment R register here
	this.loadR(this.regR+1);
	try {
		this.codeEDVector[this.getCode()]();
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
z80.codeFD=function(){
	// Increment R register here
	this.loadR(this.regR+1);
	try {
		this.codeFDVector[this.getCode()]();
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
z80.codeDDCB=function(){
	var i16=this.regIX+this.getCodeIndex();
	try {
		this.codeDDCBVector[this.getCode()](i16);
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
z80.codeFDCB=function(){
	var i16=this.regIY+this.getCodeIndex();
	try {
		this.codeFDCBVector[this.getCode()](i16);
	} catch(e) {
		console.log(e);
		this.codeVOID();
	}
};
