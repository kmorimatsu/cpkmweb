/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

function clickStep(){
	if (z80.step) {
		doStep();
	} else {
		z80.step=1;
	}
}
function clickCont(){
	if (z80.step) {
		z80.step=0;
		start();
	}
}
function clickStopAt(val){
	if (val) {
		z80.breakPoint=parseInt(val,16);
		if (z80.step) {
			z80.step=0;
			start();
		}
	}
}
function clickLogTo(val){
	if (val) {
		logto=parseInt(val,16);
		clickStep();
	} else {
		logto=0;
	}
}
function clickDump(val){
	if (val) {
		dump(parseInt(val,16));
	}
}

var log="";
var logto=0;
//z80.breakPoint=0x09db;
function debug(str){
	dom.debug(str);
	log+=str+"\r\n";
	log=log.substr(-1000,1000);
}
function debugDisplay(addr,data){
	var str="";
	str+=(addr.toString(16)+" "+("0"+data.toString(16)).substr(-2,2)).toUpperCase()+" ";
	str+="("+("000"+z80.regPC.toString(16)).substr(-4,4).toUpperCase()+") ";
	str+=new Date().getMilliseconds();
	str+="\r\n";
	str=str.substr(-200,200);
	if (200==str.length) {
		str=str.substr(str.indexOf("\n")+1);
	}
	dom.displaylog(str);
}
function showRegisters(){
	var str="";
	str+="PC:"+("000"+z80.regPC.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="AF:"+("000"+z80.regAF.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="BC:"+("000"+z80.regBC.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="DE:"+("000"+z80.regDE.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="HL:"+("000"+z80.regHL.toString(16)).substr(-4,4).toUpperCase();
	str+="<br />\r\n";
	str+="SP:"+("000"+z80.regSP.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="IX:"+("000"+z80.regIX.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="IY:"+("000"+z80.regIY.toString(16)).substr(-4,4).toUpperCase()+" ";
	str+="SZ-H-PNC:"+z80.flagS+z80.flagZ+"-"+z80.flagH+"-"+z80.flagP+z80.flagN+z80.flagC+"<br />\r\n";
//	str+="A:"+("0"+z80.regA.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="F:"+("0"+z80.regF.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="B:"+("0"+z80.regB.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="C:"+("0"+z80.regC.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="D:"+("0"+z80.regD.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="E:"+("0"+z80.regE.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="H:"+("0"+z80.regH.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="L:"+("0"+z80.regL.toString(16)).substr(-2,2).toUpperCase();
//	str+="<br />\r\n";
//	str+="IXh:"+("0"+z80.regIXh.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="IXl:"+("0"+z80.regIXl.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="IYh:"+("0"+z80.regIYh.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="IYl:"+("0"+z80.regIYl.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="SPh:"+("0"+z80.regSPh.toString(16)).substr(-2,2).toUpperCase()+" ";
//	str+="SPl:"+("0"+z80.regSPl.toString(16)).substr(-2,2).toUpperCase();
//	str+="<br />\r\n";
	str+="I:"+("0"+z80.regI.toString(16)).substr(-2,2).toUpperCase()+" ";
	str+="R:"+("0"+z80.regR.toString(16)).substr(-2,2).toUpperCase()+" ";
	str+="IFF1:"+z80.flagIFF1+" ";
	str+="IFF2:"+z80.flagIFF1+" ";
	str+="IM:"+("0"+z80.regIM.toString(16)).substr(-2,2);
	str+="<br />\r\n";
	if (this.prevstr) {
		var str2="";
		for (i=str.length-1;0<=i;i--) {
			if (this.prevstr.charAt(i)==str.charAt(i)) {
				str2=str.charAt(i)+str2;
			} else {
				str2="<b>"+str.charAt(i)+"</b>"+str2;
			}
		}
		this.prevstr=str;
		str=str2;
	} else {
		this.prevstr=str;
	}
	if (this.prevcode) str+="(done:"+this.prevcode+") ";
	str+=this.prevcode=disasm1(z80.regPC);
	debug(str);
}
function disasm1(addr){
	// Get one code from address
	var disasm="("+("000"+addr.toString(16)).substr(-4)+")\n";
	disasm+=("0"+memory.read(addr).toString(16)).substr(-2)+" ";
	disasm+=("0"+memory.read(addr+1).toString(16)).substr(-2)+" ";
	disasm+=("0"+memory.read(addr+2).toString(16)).substr(-2)+" ";
	disasm+=("0"+memory.read(addr+3).toString(16)).substr(-2)+" ";
	disasm=disassemble(disasm);
	disasm=disasm.replace(/[\r\n][\s\S]*/g,"");// Remove 2nd, 3rd and 4th line.
	disasm=disasm.replace(/^[\S]{4}[\s]/,"");  // Remove address
	return disasm;
}

function dump(from){
	var str="";
	var addr,data;
	for (addr=from;addr<from+64;addr++) {
		if ((addr&7)==0 || str=="") str+=("000"+addr.toString(16).toUpperCase()).substr(-4,4);
		data=memory.read(addr);
		str+=" "+("0"+data.toString(16)).substr(-2,2).toUpperCase();
		if ((addr&7)==7) str+="\r\n";
	}
	dom.dump(str);
}
function doStep(){
	if (z80.regPC<0x1000) {
		z80.exec(1);
	} else {
		do {
			if (logto) {
				var log="";
				do {
					z80.exec(1);
					log+=z80.regPC.toString(16)+" "+disasm1(z80.regPC)+"\r\n";
				} while (z80.regPC!=logto);
				dom.displaylog(log);
				logto=0;
			} else {
				z80.exec(1);
			}
		} while(z80.regPC<0x1000);
	}
	showRegisters();
	//dump(0x1170);
	//dump(0x1000);
	dump(z80.regPC);
}
function disassemble(mcode){
	var acode='';
	var addr=0;
	var re;
	var aline;
	var tstr;
	mcode=mcode.toUpperCase();
	mcode=mcode.replace(/[^0-9A-F\(\)]+/g,'');
	while(mcode.length){
		re=mcode.match(/^\(([0-9A-F]+)\)/);
		if (re) {
			addr=parseInt(re[1],16);
			mcode=mcode.substring(re[0].length,mcode.length);
			continue;
		}
		tstr='000'+addr.toString(16).toUpperCase();
		tstr=tstr.substr(tstr.length-4,4);
		acode=acode+tstr+' ';
		aline=code1(mcode[0]+mcode[1]);
		if (aline) {
			addr+=1;
			acode=acode+mcode[0]+mcode[1]+'       '+aline+"\r\n";
			mcode=mcode.substring(2,mcode.length);
			continue;
		}
		if (3<mcode.length) aline=code2(mcode[0]+mcode[1],mcode[2]+mcode[3],addr);
		if (aline) {
			addr+=2;
			acode=acode+mcode[0]+mcode[1]+mcode[2]+mcode[3]+'     '+aline+"\r\n";
			mcode=mcode.substring(4,mcode.length);
			continue;
		}
		if (5<mcode.length) aline=code3(mcode[0]+mcode[1],mcode[2]+mcode[3],mcode[4]+mcode[5]);
		if (aline) {
			addr+=3;
			acode=acode+mcode[0]+mcode[1]+mcode[2]+mcode[3]+mcode[4]+mcode[5]+'   '+aline+"\r\n";
			mcode=mcode.substring(6,mcode.length);
			continue;
		}
		if (7<mcode.length) aline=code4(mcode[0]+mcode[1],mcode[2]+mcode[3],mcode[4]+mcode[5],mcode[6]+mcode[7]);
		if (aline) {
			addr+=4;
			acode=acode+mcode[0]+mcode[1]+mcode[2]+mcode[3]+mcode[4]+mcode[5]+mcode[6]+mcode[7]+' '+aline+"\r\n";
			mcode=mcode.substring(8,mcode.length);
			continue;
		}
		addr+=2;
		acode=acode+mcode[0]+mcode[1]+mcode[2]+mcode[3]+'     ???'+"\r\n";
		mcode=mcode.substring(4,mcode.length);
		continue;
	}
	return acode;
}
function code1(code){
  switch(code){
    case '00': return 'NOP';
    case '02': return 'LD    (BC),A';
    case '03': return 'INC   BC';
    case '04': return 'INC   B';
    case '05': return 'DEC   B';
    case '07': return 'RLCA';
    case '08': return 'EX    AF,AF\'';
    case '09': return 'ADD   HL,BC';
    case '0A': return 'LD    A,(BC)';
    case '0B': return 'DEC   BC';
    case '0C': return 'INC   C';
    case '0D': return 'DEC   C';
    case '0F': return 'RRCA';
    case '12': return 'LD    (DE),A';
    case '13': return 'INC   DE';
    case '14': return 'INC   D';
    case '15': return 'DEC   D';
    case '17': return 'RLA';
    case '19': return 'ADD   HL,DE';
    case '1A': return 'LD    A,(DE)';
    case '1B': return 'DEC   DE';
    case '1C': return 'INC   E';
    case '1D': return 'DEC   E';
    case '1F': return 'RRA';
    case '23': return 'INC   HL';
    case '24': return 'INC   H';
    case '25': return 'DEC   H';
    case '27': return 'DAA';
    case '29': return 'ADD   HL,HL';
    case '2B': return 'DEC   HL';
    case '2C': return 'INC   L';
    case '2D': return 'DEC   L';
    case '2F': return 'CPL';
    case '33': return 'INC   SP';
    case '34': return 'INC   (HL)';
    case '35': return 'DEC   (HL)';
    case '37': return 'SCF';
    case '39': return 'ADD   HL,SP';
    case '3B': return 'DEC   SP';
    case '3C': return 'INC   A';
    case '3D': return 'DEC   A';
    case '3F': return 'CCF';
    case '40': return 'LD    B,B';
    case '41': return 'LD    B,C';
    case '42': return 'LD    B,D';
    case '43': return 'LD    B,E';
    case '44': return 'LD    B,H';
    case '45': return 'LD    B,L';
    case '46': return 'LD    B,(HL)';
    case '47': return 'LD    B,A';
    case '48': return 'LD    C,B';
    case '49': return 'LD    C,C';
    case '4A': return 'LD    C,D';
    case '4B': return 'LD    C,E';
    case '4C': return 'LD    C,H';
    case '4D': return 'LD    C,L';
    case '4E': return 'LD    C,(HL)';
    case '4F': return 'LD    C,A';
    case '50': return 'LD    D,B';
    case '51': return 'LD    D,C';
    case '52': return 'LD    D,D';
    case '53': return 'LD    D,E';
    case '54': return 'LD    D,H';
    case '55': return 'LD    D,L';
    case '56': return 'LD    D,(HL)';
    case '57': return 'LD    D,A';
    case '58': return 'LD    E,B';
    case '59': return 'LD    E,C';
    case '5A': return 'LD    E,D';
    case '5B': return 'LD    E,E';
    case '5C': return 'LD    E,H';
    case '5D': return 'LD    E,L';
    case '5E': return 'LD    E,(HL)';
    case '5F': return 'LD    E,A';
    case '60': return 'LD    H,B';
    case '61': return 'LD    H,C';
    case '62': return 'LD    H,D';
    case '63': return 'LD    H,E';
    case '64': return 'LD    H,H';
    case '65': return 'LD    H,L';
    case '66': return 'LD    H,(HL)';
    case '67': return 'LD    H,A';
    case '68': return 'LD    L,B';
    case '69': return 'LD    L,C';
    case '6A': return 'LD    L,D';
    case '6B': return 'LD    L,E';
    case '6C': return 'LD    L,H';
    case '6D': return 'LD    L,L';
    case '6E': return 'LD    L,(HL)';
    case '6F': return 'LD    L,A';
    case '70': return 'LD    (HL),B';
    case '71': return 'LD    (HL),C';
    case '72': return 'LD    (HL),D';
    case '73': return 'LD    (HL),E';
    case '74': return 'LD    (HL),H';
    case '75': return 'LD    (HL),L';
    case '76': return 'HALT';
    case '77': return 'LD    (HL),A';
    case '78': return 'LD    A,B';
    case '79': return 'LD    A,C';
    case '7A': return 'LD    A,D';
    case '7B': return 'LD    A,E';
    case '7C': return 'LD    A,H';
    case '7D': return 'LD    A,L';
    case '7E': return 'LD    A,(HL)';
    case '7F': return 'LD    A,A';
    case '80': return 'ADD   A,B';
    case '81': return 'ADD   A,C';
    case '82': return 'ADD   A,D';
    case '83': return 'ADD   A,E';
    case '84': return 'ADD   A,H';
    case '85': return 'ADD   A,L';
    case '86': return 'ADD   A,(HL)';
    case '87': return 'ADD   A,A';
    case '88': return 'ADC   A,B';
    case '89': return 'ADC   A,C';
    case '8A': return 'ADC   A,D';
    case '8B': return 'ADC   A,E';
    case '8C': return 'ADC   A,H';
    case '8D': return 'ADC   A,L';
    case '8E': return 'ADC   A,(HL)';
    case '8F': return 'ADC   A,A';
    case '90': return 'SUB   B';
    case '91': return 'SUB   C';
    case '92': return 'SUB   D';
    case '93': return 'SUB   E';
    case '94': return 'SUB   H';
    case '95': return 'SUB   L';
    case '96': return 'SUB   (HL)';
    case '97': return 'SUB   A';
    case '98': return 'SBC   A,B';
    case '99': return 'SBC   A,C';
    case '9A': return 'SBC   A,D';
    case '9B': return 'SBC   A,E';
    case '9C': return 'SBC   A,H';
    case '9D': return 'SBC   A,L';
    case '9E': return 'SBC   A,(HL)';
    case '9F': return 'SBC   A,A';
    case 'A0': return 'AND   B';
    case 'A1': return 'AND   C';
    case 'A2': return 'AND   D';
    case 'A3': return 'AND   E';
    case 'A4': return 'AND   H';
    case 'A5': return 'AND   L';
    case 'A6': return 'AND   (HL)';
    case 'A7': return 'AND   A';
    case 'A8': return 'XOR   B';
    case 'A9': return 'XOR   C';
    case 'AA': return 'XOR   D';
    case 'AB': return 'XOR   E';
    case 'AC': return 'XOR   H';
    case 'AD': return 'XOR   L';
    case 'AE': return 'XOR   (HL)';
    case 'AF': return 'XOR   A';
    case 'B0': return 'OR    B';
    case 'B1': return 'OR    C';
    case 'B2': return 'OR    D';
    case 'B3': return 'OR    E';
    case 'B4': return 'OR    H';
    case 'B5': return 'OR    L';
    case 'B6': return 'OR    (HL)';
    case 'B7': return 'OR    A';
    case 'B8': return 'CP    B';
    case 'B9': return 'CP    C';
    case 'BA': return 'CP    D';
    case 'BB': return 'CP    E';
    case 'BC': return 'CP    H';
    case 'BD': return 'CP    L';
    case 'BE': return 'CP    (HL)';
    case 'BF': return 'CP    A';
    case 'C0': return 'RET   NZ';
    case 'C1': return 'POP   BC';
    case 'C5': return 'PUSH  BC';
    case 'C7': return 'RST   00';
    case 'C8': return 'RET   Z';
    case 'C9': return 'RET';
    case 'CF': return 'RST   08';
    case 'D0': return 'RET   NC';
    case 'D1': return 'POP   DE';
    case 'D5': return 'PUSH  DE';
    case 'D7': return 'RST   10';
    case 'D8': return 'RET   C';
    case 'D9': return 'EXX';
    case 'DF': return 'RST   18';
    case 'E0': return 'RET   PO';
    case 'E1': return 'POP   HL';
    case 'E3': return 'EX    (SP),HL';
    case 'E5': return 'PUSH  HL';
    case 'E7': return 'RST   20';
    case 'E8': return 'RET   PE';
    case 'E9': return 'JP    (HL)';
    case 'EB': return 'EX    DE,HL';
    case 'EF': return 'RST   28';
    case 'F0': return 'RET   P';
    case 'F1': return 'POP   AF';
    case 'F3': return 'DI';
    case 'F5': return 'PUSH  AF';
    case 'F7': return 'RST   30';
    case 'F8': return 'RET   M';
    case 'F9': return 'LD    SP,HL';
    case 'FB': return 'EI';
    case 'FF': return 'RST   38';
    default:   return '';
  }
}
function code2(code,p1,addr){
  var rel=parseInt('0x'+p1);
  if (rel<128) rel=rel+addr+2;
  else rel=rel+addr-256+2;
  rel='000'+rel.toString(16);
  rel=rel.substr(rel.length-4,4).toUpperCase();
  switch(code){
    case '10': return 'DJNZ  '+rel;
    case '18': return 'JR    '+rel;
    case '20': return 'JR    NZ,'+rel;
    case '28': return 'JR    Z,'+rel;
    case '30': return 'JR    NC,'+rel;
    case '38': return 'JR    C,'+rel;
    case '06': return 'LD    B,'+p1;
    case '0E': return 'LD    C,'+p1;
    case '16': return 'LD    D,'+p1;
    case '1E': return 'LD    E,'+p1;
    case '26': return 'LD    H,'+p1;
    case '2E': return 'LD    L,'+p1;
    case '36': return 'LD    (HL),'+p1;
    case '3E': return 'LD    A,'+p1;
    case 'C6': return 'ADD   A,'+p1;
    case 'CE': return 'ADC   A,'+p1;
    case 'D3': return 'OUT   '+p1+',A';
    case 'D6': return 'SUB   '+p1;
    case 'DB': return 'IN    A,'+p1;
    case 'DE': return 'SBC   A,'+p1;
    case 'E6': return 'AND   '+p1;
    case 'EE': return 'XOR   '+p1;
    case 'F6': return 'OR    '+p1;
    case 'FE': return 'CP    '+p1;
    case 'CB': return codeCB(code,p1);
    case 'DD': return codeXD2(code,p1);
    case 'ED': return codeXD2(code,p1);
    case 'FD': return codeXD2(code,p1);
    default:   return '';
  }
}
function code3(code,p1,p2){
  switch(code){
    case '01': return 'LD    BC,'+p2+p1;
    case '11': return 'LD    DE,'+p2+p1;
    case '21': return 'LD    HL,'+p2+p1;
    case '22': return 'LD    ('+p2+p1+'),HL';
    case '2A': return 'LD    HL,('+p2+p1+')';
    case '31': return 'LD    SP,'+p2+p1;
    case '32': return 'LD    ('+p2+p1+'),A';
    case '3A': return 'LD    A,('+p2+p1+')';
    case 'C2': return 'JP    NZ,'+p2+p1;
    case 'C3': return 'JP    '+p2+p1;
    case 'C4': return 'CALL  NZ,'+p2+p1;
    case 'CA': return 'JP    Z,'+p2+p1;
    case 'CC': return 'CALL  Z,'+p2+p1;
    case 'CD': return 'CALL  '+p2+p1;
    case 'D2': return 'JP    NC,'+p2+p1;
    case 'D4': return 'CALL  NC,'+p2+p1;
    case 'DA': return 'JP    C,'+p2+p1;
    case 'DC': return 'CALL  C,'+p2+p1;
    case 'E2': return 'JP    PO,'+p2+p1;
    case 'E4': return 'CALL  PO,'+p2+p1;
    case 'EA': return 'JP    PE,'+p2+p1;
    case 'EC': return 'CALL  PE,'+p2+p1;
    case 'F2': return 'JP    P,'+p2+p1;
    case 'F4': return 'CALL  P,'+p2+p1;
    case 'FA': return 'JP    M,'+p2+p1;
    case 'FC': return 'CALL  M,'+p2+p1;
    case 'DD': return codeXD3(code,p1,p2);
    case 'ED': return codeXD3(code,p1,p2);
    case 'FD': return codeXD3(code,p1,p2);
    default: return '';
  }
}
function code4(code,p1,p2,p3){
  switch(code){
    case 'DD': return codeXD4(code,p1,p2,p3);
    case 'ED': return codeXD4(code,p1,p2,p3);
    case 'FD': return codeXD4(code,p1,p2,p3);
    default:   return '';
  }
}
function codeCB(code,p1){
  if (code!='CB') return '';
  switch(p1){
    case '00': return 'RLC   B';
    case '01': return 'RLC   C';
    case '02': return 'RLC   D';
    case '03': return 'RLC   E';
    case '04': return 'RLC   H';
    case '05': return 'RLC   L';
    case '06': return 'RLC   (HL)';
    case '07': return 'RLC   A';
    case '08': return 'RRC   B';
    case '09': return 'RRC   C';
    case '0A': return 'RRC   D';
    case '0B': return 'RRC   E';
    case '0C': return 'RRC   H';
    case '0D': return 'RRC   L';
    case '0E': return 'RRC   (HL)';
    case '0F': return 'RRC   A';
    case '10': return 'RL    B';
    case '11': return 'RL    C';
    case '12': return 'RL    D';
    case '13': return 'RL    E';
    case '14': return 'RL    H';
    case '15': return 'RL    L';
    case '16': return 'RL    (HL)';
    case '17': return 'RL    A';
    case '18': return 'RR    B';
    case '19': return 'RR    C';
    case '1A': return 'RR    D';
    case '1B': return 'RR    E';
    case '1C': return 'RR    H';
    case '1D': return 'RR    L';
    case '1E': return 'RR    (HL)';
    case '1F': return 'RR    A';
    case '20': return 'SLA   B';
    case '21': return 'SLA   C';
    case '22': return 'SLA   D';
    case '23': return 'SLA   E';
    case '24': return 'SLA   H';
    case '25': return 'SLA   L';
    case '26': return 'SLA   (HL)';
    case '27': return 'SLA   A';
    case '28': return 'SRA   B';
    case '29': return 'SRA   C';
    case '2A': return 'SRA   D';
    case '2B': return 'SRA   E';
    case '2C': return 'SRA   H';
    case '2D': return 'SRA   L';
    case '2E': return 'SRA   (HL)';
    case '2F': return 'SRA   A';
    case '38': return 'SRL   B';
    case '39': return 'SRL   C';
    case '3A': return 'SRL   D';
    case '3B': return 'SRL   E';
    case '3C': return 'SRL   H';
    case '3D': return 'SRL   L';
    case '3E': return 'SRL   (HL)';
    case '3F': return 'SRL   A';
    case '40': return 'BIT   0,B';
    case '41': return 'BIT   0,C';
    case '42': return 'BIT   0,D';
    case '43': return 'BIT   0,E';
    case '44': return 'BIT   0,H';
    case '45': return 'BIT   0,L';
    case '46': return 'BIT   0,(HL)';
    case '47': return 'BIT   0,A';
    case '48': return 'BIT   1,B';
    case '49': return 'BIT   1,C';
    case '4A': return 'BIT   1,D';
    case '4B': return 'BIT   1,E';
    case '4C': return 'BIT   1,H';
    case '4D': return 'BIT   1,L';
    case '4E': return 'BIT   1,(HL)';
    case '4F': return 'BIT   1,A';
    case '50': return 'BIT   2,B';
    case '51': return 'BIT   2,C';
    case '52': return 'BIT   2,D';
    case '53': return 'BIT   2,E';
    case '54': return 'BIT   2,H';
    case '55': return 'BIT   2,L';
    case '56': return 'BIT   2,(HL)';
    case '57': return 'BIT   2,A';
    case '58': return 'BIT   3,B';
    case '59': return 'BIT   3,C';
    case '5A': return 'BIT   3,D';
    case '5B': return 'BIT   3,E';
    case '5C': return 'BIT   3,H';
    case '5D': return 'BIT   3,L';
    case '5E': return 'BIT   3,(HL)';
    case '5F': return 'BIT   3,A';
    case '60': return 'BIT   4,B';
    case '61': return 'BIT   4,C';
    case '62': return 'BIT   4,D';
    case '63': return 'BIT   4,E';
    case '64': return 'BIT   4,H';
    case '65': return 'BIT   4,L';
    case '66': return 'BIT   4,(HL)';
    case '67': return 'BIT   4,A';
    case '68': return 'BIT   5,B';
    case '69': return 'BIT   5,C';
    case '6A': return 'BIT   5,D';
    case '6B': return 'BIT   5,E';
    case '6C': return 'BIT   5,H';
    case '6D': return 'BIT   5,L';
    case '6E': return 'BIT   5,(HL)';
    case '6F': return 'BIT   5,A';
    case '70': return 'BIT   6,B';
    case '71': return 'BIT   6,C';
    case '72': return 'BIT   6,D';
    case '73': return 'BIT   6,E';
    case '74': return 'BIT   6,H';
    case '75': return 'BIT   6,L';
    case '76': return 'BIT   6,(HL)';
    case '77': return 'BIT   6,A';
    case '78': return 'BIT   7,B';
    case '79': return 'BIT   7,C';
    case '7A': return 'BIT   7,D';
    case '7B': return 'BIT   7,E';
    case '7C': return 'BIT   7,H';
    case '7D': return 'BIT   7,L';
    case '7E': return 'BIT   7,(HL)';
    case '7F': return 'BIT   7,A';
    case '80': return 'RES   0,B';
    case '81': return 'RES   0,C';
    case '82': return 'RES   0,D';
    case '83': return 'RES   0,E';
    case '84': return 'RES   0,H';
    case '85': return 'RES   0,L';
    case '86': return 'RES   0,(HL)';
    case '87': return 'RES   0,A';
    case '88': return 'RES   1,B';
    case '89': return 'RES   1,C';
    case '8A': return 'RES   1,D';
    case '8B': return 'RES   1,E';
    case '8C': return 'RES   1,H';
    case '8D': return 'RES   1,L';
    case '8E': return 'RES   1,(HL)';
    case '8F': return 'RES   1,A';
    case '90': return 'RES   2,B';
    case '91': return 'RES   2,C';
    case '92': return 'RES   2,D';
    case '93': return 'RES   2,E';
    case '94': return 'RES   2,H';
    case '95': return 'RES   2,L';
    case '96': return 'RES   2,(HL)';
    case '97': return 'RES   2,A';
    case '98': return 'RES   3,B';
    case '99': return 'RES   3,C';
    case '9A': return 'RES   3,D';
    case '9B': return 'RES   3,E';
    case '9C': return 'RES   3,H';
    case '9D': return 'RES   3,L';
    case '9E': return 'RES   3,(HL)';
    case '9F': return 'RES   3,A';
    case 'A0': return 'RES   4,B';
    case 'A1': return 'RES   4,C';
    case 'A2': return 'RES   4,D';
    case 'A3': return 'RES   4,E';
    case 'A4': return 'RES   4,H';
    case 'A5': return 'RES   4,L';
    case 'A6': return 'RES   4,(HL)';
    case 'A7': return 'RES   4,A';
    case 'A8': return 'RES   5,B';
    case 'A9': return 'RES   5,C';
    case 'AA': return 'RES   5,D';
    case 'AB': return 'RES   5,E';
    case 'AC': return 'RES   5,H';
    case 'AD': return 'RES   5,L';
    case 'AE': return 'RES   5,(HL)';
    case 'AF': return 'RES   5,A';
    case 'B0': return 'RES   6,B';
    case 'B1': return 'RES   6,C';
    case 'B2': return 'RES   6,D';
    case 'B3': return 'RES   6,E';
    case 'B4': return 'RES   6,H';
    case 'B5': return 'RES   6,L';
    case 'B6': return 'RES   6,(HL)';
    case 'B7': return 'RES   6,A';
    case 'B8': return 'RES   7,B';
    case 'B9': return 'RES   7,C';
    case 'BA': return 'RES   7,D';
    case 'BB': return 'RES   7,E';
    case 'BC': return 'RES   7,H';
    case 'BD': return 'RES   7,L';
    case 'BE': return 'RES   7,(HL)';
    case 'BF': return 'RES   7,A';
    case 'C0': return 'SET   0,B';
    case 'C1': return 'SET   0,C';
    case 'C2': return 'SET   0,D';
    case 'C3': return 'SET   0,E';
    case 'C4': return 'SET   0,H';
    case 'C5': return 'SET   0,L';
    case 'C6': return 'SET   0,(HL)';
    case 'C7': return 'SET   0,A';
    case 'C8': return 'SET   1,B';
    case 'C9': return 'SET   1,C';
    case 'CA': return 'SET   1,D';
    case 'CB': return 'SET   1,E';
    case 'CC': return 'SET   1,H';
    case 'CD': return 'SET   1,L';
    case 'CE': return 'SET   1,(HL)';
    case 'CF': return 'SET   1,A';
    case 'D0': return 'SET   2,B';
    case 'D1': return 'SET   2,C';
    case 'D2': return 'SET   2,D';
    case 'D3': return 'SET   2,E';
    case 'D4': return 'SET   2,H';
    case 'D5': return 'SET   2,L';
    case 'D6': return 'SET   2,(HL)';
    case 'D7': return 'SET   2,A';
    case 'D8': return 'SET   3,B';
    case 'D9': return 'SET   3,C';
    case 'DA': return 'SET   3,D';
    case 'DB': return 'SET   3,E';
    case 'DC': return 'SET   3,H';
    case 'DD': return 'SET   3,L';
    case 'DE': return 'SET   3,(HL)';
    case 'DF': return 'SET   3,A';
    case 'E0': return 'SET   4,B';
    case 'E1': return 'SET   4,C';
    case 'E2': return 'SET   4,D';
    case 'E3': return 'SET   4,E';
    case 'E4': return 'SET   4,H';
    case 'E5': return 'SET   4,L';
    case 'E6': return 'SET   4,(HL)';
    case 'E7': return 'SET   4,A';
    case 'E8': return 'SET   5,B';
    case 'E9': return 'SET   5,C';
    case 'EA': return 'SET   5,D';
    case 'EB': return 'SET   5,E';
    case 'EC': return 'SET   5,H';
    case 'ED': return 'SET   5,L';
    case 'EE': return 'SET   5,(HL)';
    case 'EF': return 'SET   5,A';
    case 'F0': return 'SET   6,B';
    case 'F1': return 'SET   6,C';
    case 'F2': return 'SET   6,D';
    case 'F3': return 'SET   6,E';
    case 'F4': return 'SET   6,H';
    case 'F5': return 'SET   6,L';
    case 'F6': return 'SET   6,(HL)';
    case 'F7': return 'SET   6,A';
    case 'F8': return 'SET   7,B';
    case 'F9': return 'SET   7,C';
    case 'FA': return 'SET   7,D';
    case 'FB': return 'SET   7,E';
    case 'FC': return 'SET   7,H';
    case 'FD': return 'SET   7,L';
    case 'FE': return 'SET   7,(HL)';
    case 'FF': return 'SET   7,A';
    default: return '???';
  }
}
function codeXD2(code,p1){
  switch(code+p1){
    case 'DD09': return 'ADD   IX,BC';
    case 'DD19': return 'ADD   IX,DE';
    case 'DD23': return 'INC   IX';
    case 'DD29': return 'ADD   IX,IX';
    case 'DD2B': return 'DEC   IX';
    case 'DD35': return 'DEC   (IX+D)';
    case 'DD39': return 'ADD   IX,SP';
    case 'DDE1': return 'POP   IX';
    case 'DDE3': return 'EX    (SP),IX';
    case 'DDE5': return 'PUSH   IX';
    case 'DDE9': return 'JP    (IX)';
    case 'DDF9': return 'LD    SP,IX';
    case 'ED40': return 'IN    B,(C)';
    case 'ED41': return 'OUT   (C),B';
    case 'ED42': return 'SBC   HL,BC';
    case 'ED44': return 'NEG';
    case 'ED45': return 'RETN';
    case 'ED46': return 'IM    0';
    case 'ED47': return 'LD    I,A';
    case 'ED48': return 'IN    C,(C)';
    case 'ED49': return 'OUT   (C),C';
    case 'ED4A': return 'ADC   HL,BC';
    case 'ED4D': return 'RETI';
    case 'ED4F': return 'LD    R,A';
    case 'ED50': return 'IN    D,(C)';
    case 'ED51': return 'OUT   (C),D';
    case 'ED52': return 'SBC   HL,DE';
    case 'ED56': return 'IM    1';
    case 'ED57': return 'LD    A,I';
    case 'ED58': return 'IN    E,(C)';
    case 'ED59': return 'OUT   (C),E';
    case 'ED5A': return 'ADC   HL,DE';
    case 'ED5E': return 'IM    2';
    case 'ED5F': return 'LD    A,R';
    case 'ED60': return 'IN    H,(C)';
    case 'ED61': return 'OUT   (C),H';
    case 'ED62': return 'SBC   HL,HL';
    case 'ED67': return 'RRD';
    case 'ED68': return 'IN    L,(C)';
    case 'ED69': return 'OUT   (C),L';
    case 'ED6A': return 'ADC   HL,HL';
    case 'ED6F': return 'RLD';
    case 'ED72': return 'SBC   HL,SP';
    case 'ED78': return 'IN    A,(C)';
    case 'ED79': return 'OUT   (c),A';
    case 'ED7A': return 'ADC   HL,SP';
    case 'EDA0': return 'LDI';
    case 'EDA1': return 'CPI';
    case 'EDA2': return 'INI';
    case 'EDA3': return 'OUTI';
    case 'EDA8': return 'LDD';
    case 'EDA9': return 'CPD';
    case 'EDAA': return 'IND';
    case 'EDAB': return 'OUTD';
    case 'EDB0': return 'LDIR';
    case 'EDB1': return 'CPIR';
    case 'EDB2': return 'INIR';
    case 'EDB3': return 'OTIR';
    case 'EDB8': return 'LDDR';
    case 'EDB9': return 'CPDR';
    case 'EDBA': return 'INDR';
    case 'EDBB': return 'OTDR';
    case 'FD09': return 'ADD   IY,BC';
    case 'FD19': return 'ADD   IY,DE';
    case 'FD23': return 'INC   IY';
    case 'FD29': return 'ADD   IY,IY';
    case 'FD2B': return 'DEC   IY';
    case 'FD35': return 'DEC   (IY+D)';
    case 'FD39': return 'ADD   IY,SP';
    case 'FDE1': return 'POP   IY';
    case 'FDE3': return 'EX    (SP),IY';
    case 'FDE5': return 'PUSH  IY';
    case 'FDE9': return 'JP    (IY)';
    case 'FDF9': return 'LD    SP,IY';
    default:     return '';
  }
}
function codeXD3(code,p1,p2){
  switch(code+p1){
    case 'DD34': return 'INC   (IX+'+p2+')';
    case 'DD46': return 'LD    B,(IX+'+p2+')';
    case 'DD4E': return 'LD    C,(IX+'+p2+')';
    case 'DD56': return 'LD    D,(IX+'+p2+')';
    case 'DD5E': return 'LD    E,(IX+'+p2+')';
    case 'DD66': return 'LD    H,(IX+'+p2+')';
    case 'DD6E': return 'LD    L,(IX+'+p2+')';
    case 'DD70': return 'LD    (IX+'+p2+'),B';
    case 'DD71': return 'LD    (IX+'+p2+'),C';
    case 'DD72': return 'LD    (IX+'+p2+'),D';
    case 'DD73': return 'LD    (IX+'+p2+'),E';
    case 'DD74': return 'LD    (IX+'+p2+'),H';
    case 'DD75': return 'LD    (IX+'+p2+'),L';
    case 'DD77': return 'LD    (IX+'+p2+'),A';
    case 'DD7E': return 'LD    A,(IX+'+p2+')';
    case 'DD86': return 'ADD   A,(IX+'+p2+')';
    case 'DD8E': return 'ADC   A,(IX+'+p2+')';
    case 'DD96': return 'SUB   A,(IX+'+p2+')';
    case 'DD9E': return 'SBC   A,(IX+'+p2+')';
    case 'DDA6': return 'AND   (IX+'+p2+')';
    case 'DDAE': return 'XOR   (IX+'+p2+')';
    case 'DDB6': return 'OR    (IX+'+p2+')';
    case 'DDBE': return 'CP    (IX+'+p2+')';
    case 'FD34': return 'INC   (IY+'+p2+')';
    case 'FD46': return 'LD    B,(IY+'+p2+')';
    case 'FD4E': return 'LD    C,(IY+'+p2+')';
    case 'FD56': return 'LD    D,(IY+'+p2+')';
    case 'FD5E': return 'LD    E,(IY+'+p2+')';
    case 'FD66': return 'LD    H,(IY+'+p2+')';
    case 'FD6E': return 'LD    L,(IY+'+p2+')';
    case 'FD70': return 'LD    (IY+'+p2+'),B';
    case 'FD71': return 'LD    (IY+'+p2+'),C';
    case 'FD72': return 'LD    (IY+'+p2+'),D';
    case 'FD73': return 'LD    (IY+'+p2+'),E';
    case 'FD74': return 'LD    (IY+'+p2+'),H';
    case 'FD75': return 'LD    (IY+'+p2+'),L';
    case 'FD77': return 'LD    (IY+'+p2+'),A';
    case 'FD7E': return 'LD    A,(IY+'+p2+')';
    case 'FD86': return 'ADD   A,(IY+'+p2+')';
    case 'FD8E': return 'ADC   A,(IY+'+p2+')';
    case 'FD96': return 'SUB   A,(IY+'+p2+')';
    case 'FD9E': return 'SBC   A,(IY+'+p2+')';
    case 'FDA6': return 'AND   (IY+'+p2+')';
    case 'FDAE': return 'XOR   (IY+'+p2+')';
    case 'FDB6': return 'OR    (IY+'+p2+')';
    case 'FDBE': return 'CP    (IY+'+p2+')';
    default:     return '';
  }
}
function codeXD4(code,p1,p2,p3){
  switch(code+p1){
    case 'DD21': return 'LD    IX,'+p3+p2;
    case 'DD22': return 'LD    ('+p3+p2+'),IX';
    case 'DD2A': return 'LD    IX,('+p3+p2+')';
    case 'DD36': return 'LD    (IX+'+p2+'),'+p3;
    case 'ED43': return 'LD    ('+p3+p2+'),BC';
    case 'ED4B': return 'LD    BC,('+p3+p2+')';
    case 'ED53': return 'LD    ('+p3+p2+'),DE';
    case 'ED5B': return 'LD    DE,('+p3+p2+')';
    case 'ED73': return 'LD    ('+p3+p2+'),SP';
    case 'ED7B': return 'LD    SP,('+p3+p2+')';
    case 'FD21': return 'LD    IY,'+p3+p2;
    case 'FD22': return 'LD    ('+p3+p2+'),IY';
    case 'FD2A': return 'LD    IY,('+p3+p2+')';
    case 'FD36': return 'LD    (IY+'+p2+'),'+p3;
    default:     break;
  }
  switch(code+p1+p3){
    case 'DDCB06': return 'RLC   (IX+'+p2+')';
    case 'DDCB0E': return 'RRC   (IX+'+p2+')';
    case 'DDCB16': return 'RL    (IX+'+p2+')';
    case 'DDCB1E': return 'RR    (IX+'+p2+')';
    case 'DDCB26': return 'SLA   (IX+'+p2+')';
    case 'DDCB2E': return 'SRA   (IX+'+p2+')';
    case 'DDCB3E': return 'SRL   (IX+'+p2+')';
    case 'DDCB46': return 'BIT   0,(IX+'+p2+')';
    case 'DDCB4E': return 'BIT   1,(IX+'+p2+')';
    case 'DDCB56': return 'BIT   2,(IX+'+p2+')';
    case 'DDCB5E': return 'BIT   3,(IX+'+p2+')';
    case 'DDCB66': return 'BIT   4,(IX+'+p2+')';
    case 'DDCB6E': return 'BIT   5,(IX+'+p2+')';
    case 'DDCB76': return 'BIT   6,(IX+'+p2+')';
    case 'DDCB7E': return 'BIT   7,(IX+'+p2+')';
    case 'DDCB86': return 'RES   0,(IX+'+p2+')';
    case 'DDCB8E': return 'RES   1,(IX+'+p2+')';
    case 'DDCB96': return 'RES   2,(IX+'+p2+')';
    case 'DDCB9E': return 'RES   3,(IX+'+p2+')';
    case 'DDCBA6': return 'RES   4,(IX+'+p2+')';
    case 'DDCBAE': return 'RES   5,(IX+'+p2+')';
    case 'DDCBB6': return 'RES   6,(IX+'+p2+')';
    case 'DDCBBE': return 'RES   7,(IX+'+p2+')';
    case 'DDCBC6': return 'SET   0,(IX+'+p2+')';
    case 'DDCBCE': return 'SET   1,(IX+'+p2+')';
    case 'DDCBD6': return 'SET   2,(IX+'+p2+')';
    case 'DDCBDE': return 'SET   3,(IX+'+p2+')';
    case 'DDCBE6': return 'SET   4,(IX+'+p2+')';
    case 'DDCBEE': return 'SET   5,(IX+'+p2+')';
    case 'DDCBF6': return 'SET   6,(IX+'+p2+')';
    case 'DDCBFE': return 'SET   7,(IX+'+p2+')';
    case 'FDCB06': return 'RLC   (IY+'+p2+')';
    case 'FDCB0E': return 'RRC   (IY+'+p2+')';
    case 'FDCB16': return 'RL    (IY+'+p2+')';
    case 'FDCB1E': return 'RR    (IY+'+p2+')';
    case 'FDCB26': return 'SLA   (IY+'+p2+')';
    case 'FDCB2E': return 'SRA   (IY+'+p2+')';
    case 'FDCB3E': return 'SRL   (IY+'+p2+')';
    case 'FDCB46': return 'BIT   0,(IY+'+p2+')';
    case 'FDCB4E': return 'BIT   1,(IY+'+p2+')';
    case 'FDCB56': return 'BIT   2,(IY+'+p2+')';
    case 'FDCB5E': return 'BIT   3,(IY+'+p2+')';
    case 'FDCB66': return 'BIT   4,(IY+'+p2+')';
    case 'FDCB6E': return 'BIT   5,(IY+'+p2+')';
    case 'FDCB76': return 'BIT   6,(IY+'+p2+')';
    case 'FDCB7E': return 'BIT   7,(IY+'+p2+')';
    case 'FDCB86': return 'RES   0,(IY+'+p2+')';
    case 'FDCB8E': return 'RES   1,(IY+'+p2+')';
    case 'FDCB96': return 'RES   2,(IY+'+p2+')';
    case 'FDCB9E': return 'RES   3,(IY+'+p2+')';
    case 'FDCBA6': return 'RES   4,(IY+'+p2+')';
    case 'FDCBAE': return 'RES   5,(IY+'+p2+')';
    case 'FDCBB6': return 'RES   6,(IY+'+p2+')';
    case 'FDCBBE': return 'RES   7,(IY+'+p2+')';
    case 'FDCBC6': return 'SET   0,(IY+'+p2+')';
    case 'FDCBCE': return 'SET   1,(IY+'+p2+')';
    case 'FDCBD6': return 'SET   2,(IY+'+p2+')';
    case 'FDCBDE': return 'SET   3,(IY+'+p2+')';
    case 'FDCBE6': return 'SET   4,(IY+'+p2+')';
    case 'FDCBEE': return 'SET   5,(IY+'+p2+')';
    case 'FDCBF6': return 'SET   6,(IY+'+p2+')';
    case 'FDCBFE': return 'SET   7,(IY+'+p2+')';
    default:       return '';
  }
}

