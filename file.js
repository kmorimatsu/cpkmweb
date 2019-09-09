/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	file.loaded(obj);
	file.setFile(obj);
*/
file=new Object();
file.setFile=function(obj){
	// Show the file upload input.
	obj.style.display='block';
	// Show the dialog to upload local file.
	obj.click();
};
file.name='';
file.loaded=function(obj){
	// This will be called when a file is uploaded.
	// If FileReader API is not supported, following code will fail.
	var fr = new FileReader();
	fr.onload = function () {
		var data=new Uint8Array(fr.result);
		file.update(data);
	};
	this.name=obj.files[0].name;
	fr.readAsArrayBuffer(obj.files[0]);
	obj.style.display='none';
};
file.update=function(data){
	// This will be called when a file is sucessfully loaded by FileReader API.
	// Data will be given as an array
	// Check if ZIP archive.
	if (data[0]==0x50 && data[1]==0x4B && data[2]==0x03 && data[3]==0x04) {
		// Zip archive
		var zip=new JSZip(data);
		var data2=zip.file("cpmdisks").asUint8Array();
		data=data2;
	}
	
	if ((0xdc00-0x0100)<data.length) {
		// This must be disk image file
		// Update diskimage data, clear screen, and reset i8255 and Z80
		disk.update(data);
		display.cls();
		i8255.reset();
		z80.reset();
		document.getElementById('savebutton').style.display='block';
	} else {
		// This must be CP/M file
		// Load the file from 0x0100, and save it in CP/M.
		memory.load(data);
		var command="save "+parseInt((data.length+127)/128)+" "+this.name.toUpperCase()+"\n";
		i8255.setCommand(command);
	}
}
