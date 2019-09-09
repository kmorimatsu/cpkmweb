/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	io.read(addrL,addrH);
	io.write(addrL,addrH,data);
*/
io=new Object();
io.read=function(addrL,addrH){
	return i8255.read(addrL & 0x03);
};
io.write=function(addrL,addrH,data){
	i8255.write(addrL & 0x03,data & 0x00ff);
};
