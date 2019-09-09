/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	memory.initrom();
	
	The ROM is assigned at 0x0000-0x7FFF.
	When the system is reset, ROM (but not RAM) is selected.
	The ROM code copies BIOS from address 0x7200-0x7FFF to 0xF200-0xFFFF.
*/

memory.rom=Array(32768);
memory.biosihx=(function(){/*
:0DDC000000000000000000000000006FDFC9
:0CDC0D0000000000000087DC4BDC07DD9D
:0CDC190087DD6FDF00000000000087DCEA
:06DC25005ADC27DD01DEE0
:0CDC2B006FDF00000000000087DC69DCF7
:0CDC370047DD7BDE6FDF00000000000016
:06DC430087DC78DC67DDE0
:0DDC4900F5DE4000040F00CB037F00C0009B
:0EDC5600200001004000040F00CF037F00C03B
:0EDC6400002000F4004000040F00CF037F00FA
:0DDC7200C0002000E8014000040F00CF03B7
:08DC7F007F00C0002000DC0260
:01DEF500002C
:0AD20000C342D2C3AAD2C31CD3C399
:09D20A0031D3C346D3C35BD3C387
:09D213005CD3C35DD3C360D3C337
:09D21C0088D3C3B3D3C3C2D3C34A
:09D22500D1D3C3E0D3C32DD4C35F
:09D22E0074D4C376D4C333D2C317
:09D2370036D2C339D2C33CD2C384
:0ED240003FD2F33140DF3E92D3033EFFD302D4
:0DD24E003E02D3033EC33200003205002132
:0DD25B0003D22201002106C4220600AF32DA
:0DD2680003003E03D3032177D2CD7AD4C357
:0ED27500AAD22A2A2A2043502F4B4D2042498C
:0ED283004F53204B4D2D3230313020203139A9
:0ED2910035324B20627974657320782034208A
:0DD29F00447269766573202A2A2A00F33153
:0DD2AC0040DF3E92D3033EFFD3020E00CDC3
:0ED2B90088D3010000CDB3D32100BC110000CA
:0ED2C700424BCDC2D3444DCDD1D3CDE0D33DAB
:0ED2D500281501800009133E2CBB20E63E0206
:0DD2E300D3033A03004FC300BC21F4D2CDA9
:0ED2F0007AD418FE4469736B20526561642085
:0ED2FE004572726F7220647572696E67206CE3
:0ED30C006F6164696E67204343502F42444FA7
:0DD31A005300ED7300DC3180DFCD8BD4CDEE
:0CD3270033D2CD84D4ED7B00DCC9ED7363
:0CD3330000DC3180DFCD8BD4CD36D2CDB4
:0ED33F0084D4ED7B00DCC9ED7300DC3180DFAF
:0BD34D00CD8BD4CD39D2CD84D4ED7B44
:0ED3580000DCC9C9C93E1AC92200DC2A02DC69
:0ED366002D200521F40018132D200521E801CB
:0ED37400180B2D200521DC02180321010022D8
:0ED3820003DC2A00DCC93200DC790D20052115
:0ED390001BDC18140D2005212BDC180C0D20C1
:0ED39E0005213BDC1804AF210BDC2209DC4F1B
:0CD3AC003202DC3A00DCC93200DC7932CD
:0BD3B80003DC783204DC3A00DCC932F0
:0BD3C30000DC793205DC783206DC3A31
:0CD3CE0000DCC93200DC793207DC783268
:0ED3DA0008DC3A00DCC9ED7300DC3180DFE5D1
:0ED3E800C5D5CD8BD42A05DC545D2A03DCCBE1
:0ED3F60025CB14CB25CB14CB25CB14CB25CBCC
:0ED4040014CB25CB14CB25CB1419CD3CD2CDA7
:0ED4120084D4FE01280D2A07DC545D2180FF22
:0ED42000018000EDB0D1C1E1ED7B00DCC9ED73
:0DD42E007300DC3180DFE5C5D52A07DC1175
:0DD43B0080FF018000EDB02A05DC545D2A61
:0ED4480003DCCB25CB14CB25CB14CB25CB148A
:0ED45600CB25CB14CB25CB14CB25CB1419CD75
:0DD464008BD4CD3FD2CD84D4D1C1E1ED7B7E
:0ED4710000DCC9AFC96069C9C94EAFB9C8CDEA
:0ED47F0046D32318F6F53E02D303F1C9F53E5D
:05D48D0003D303F1C907
:00000001FF
*/}).toString().match(/\/\*([\s\S]*)\*\//)[1];
memory.initrom=function(){
	var i;
	for(i=0;i<32768;i++){
		memory.rom[i]=0x76; // HALT
	}
	// BOOT region
	/*
	(0000)
	ld hl,7200
	ld de,d200
	ld bc,0e00
	ldir
	jp d200
	*/
	var a=[
	0x21,0x00,0x72,0x11,0x00,0xd2,0x01,0x00,0x0e,0xed,0xb0,0xc3,0x00,0xd2
	];
	for(i=0;i<a.length;i++){
		memory.rom[i]=a[i];
	}
	// Construct BIOS copy from 0x7200
	var re=/:([0-9A-F]{2})([0-9A-F]{4})([0-9A-F]{2})([0-9A-F]*)([0-9A-F]{2})/i;
	var ihxdata=this.biosihx.split("\n");
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
			//memory.write(addr+j,b);
			this.rom[addr+j-0x6000]=b;
		}
		// Checksum is ignored.
	}
};
/*
; This file can be assembled by SDCC:
; sdasz80 -o %1
; sdcc *.rel -mz80 --code-loc 0xd200 --data-loc 0xdc00 --no-std-crt0

; There are four drives, A, B, C, and D
; 128 bytes/sector
; 64 sector/track
; 244 track/drive
; The first track in drive A (total 8192 bytes) is used
; to load CCP and BDOS into RAM.

; 8255 is assigned to port 0x00-0x03
; Port C1 (output) is used to select RAM/ROM for address 0x0000-0x7FFF
; If C1=1 (or port C is set for input), ROM is selected.
; If C1=0, RAM is selected.
.area _DATA
; Data area follows
; This area is also used in ROM routines
; Data area is 0xDC00-0xDF7F, including stack area.
; 0xDF80-0xDFFF (128 bytes) is used for buffer for disk read/write
; 

storeSP:   .dw 0
diskNum:   .db 0
trackNum:  .dw 0
sectorNum: .dw 0
dmAddress: .dw 0
pDPH:      .dw 0

jWBOOT     =0x0000  ; JUMP WBOOT address
IOBYTE     =0x0003  ; IOBYTE for CBIOS
jBDOS      =0x0005  ; JUMP BDOS address
ccpStart   =0xbc00  ; Using 54K system
bootStack  =0xDF40  ; Stark area for BOOT is from 0xDF00 and to 0xDF3F
biosStack  =0xDF80  ; Stack area for BIOS is from 0xDF00 and to 0xDF7F
diskBuff   =0xFF80  ; 128 bytes buffer for disk read/write by BIOS

; Disk Parameter Header (DPH) follows
; There are 4 parameters for drives A, B, C, and D
dph0:
	.dw trans ;XLT: Address of translation table
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw dirbuf ;DIRBUF: Address of a dirbuff scratchpad
	.dw dpb0 ;DPB: Address of a disk parameter block
	.dw chk0 ;CSV: Address of scratchpad area for changed disks
	.dw all0 ;ALV: Address of an allocation info scratchpad
dph1:
	.dw trans ;XLT: Address of translation table
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw dirbuf ;DIRBUF: Address of a dirbuff scratchpad
	.dw dpb1 ;DPB: Address of a disk parameter block
	.dw chk1 ;CSV: Address of scratchpad area for changed disks
	.dw all1 ;ALV: Address of an allocation info scratchpad
dph2:
	.dw trans ;XLT: Address of translation table
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw dirbuf ;DIRBUF: Address of a dirbuff scratchpad
	.dw dpb2 ;DPB: Address of a disk parameter block
	.dw chk2 ;CSV: Address of scratchpad area for changed disks
	.dw all2 ;ALV: Address of an allocation info scratchpad
dph3:
	.dw trans ;XLT: Address of translation table
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw 0 ;000: Scratchpad
	.dw dirbuf ;DIRBUF: Address of a dirbuff scratchpad
	.dw dpb3 ;DPB: Address of a disk parameter block
	.dw chk3 ;CSV: Address of scratchpad area for changed disks
	.dw all3 ;ALV: Address of an allocation info scratchpad

; Disk Parameter Brock (DPB) follows
; There are 4 brocks for drives A, B, C, and D
dpb0:
	.dw 64 ;SPT: sectors per track
	.db 4 ;BSH: data allocation block shift factor
	.db 15 ;BLM: Data Allocation Mask
	.db 0 ;Extent mask
	.dw 971 ;DSM: Disk storage capacity. Use 975 for drives 1-3.
	.dw 127 ;DRM, no of directory entries
	.db 192 ;AL0
	.db 0 ;AL1
	.dw 32 ;CKS, size of dir check vector
	.dw 1 ;OFF, no of reserved tracks Use 244, 488, and 732 for drives 1, 2, and 3.
dpb1:
	.dw 64 ;SPT: sectors per track
	.db 4 ;BSH: data allocation block shift factor
	.db 15 ;BLM: Data Allocation Mask
	.db 0 ;Extent mask
	.dw 975 ;DSM: Disk storage capacity.
	.dw 127 ;DRM, no of directory entries
	.db 192 ;AL0
	.db 0 ;AL1
	.dw 32 ;CKS, size of dir check vector
	.dw 244 ;OFF, no of reserved tracks
dpb2:
	.dw 64 ;SPT: sectors per track
	.db 4 ;BSH: data allocation block shift factor
	.db 15 ;BLM: Data Allocation Mask
	.db 0 ;Extent mask
	.dw 975 ;DSM: Disk storage capacity.
	.dw 127 ;DRM, no of directory entries
	.db 192 ;AL0
	.db 0 ;AL1
	.dw 32 ;CKS, size of dir check vector
	.dw 488 ;OFF, no of reserved tracks 
dpb3:
	.dw 64 ;SPT: sectors per track
	.db 4 ;BSH: data allocation block shift factor
	.db 15 ;BLM: Data Allocation Mask
	.db 0 ;Extent mask
	.dw 975 ;DSM: Disk storage capacity.
	.dw 127 ;DRM, no of directory entries
	.db 192 ;AL0
	.db 0 ;AL1
	.dw 32 ;CKS, size of dir check vector
	.dw 732 ;OFF, no of reserved tracks

dirbuf: .ds 128
chk0:   .ds 32
chk1:   .ds 32
chk2:   .ds 32
chk3:   .ds 32
all0:   .ds 122
all1:   .ds 122
all2:   .ds 122
all3:   .ds 122

trans:  .db 0

; End of data area

.area _CODE
; BIOS jump table (CP/M)
JP CBOOT           ;0xd200
JP WBOOT           ;0xd203
JP CONST           ;0xd206
JP CONIN           ;0xd209
JP CONOUT          ;0xd20c
JP LIST            ;0xd20f
JP PUNCH           ;0xd212
JP READER          ;0xd215
JP HOME            ;0xd218
JP SELDSK          ;0xd21b
JP SETTRK          ;0xd21e
JP SETSEC          ;0xd221
JP SETDMA          ;0xd224
JP READ            ;0xd227
JP WRITE           ;0xd22a
JP LISTST          ;0xd22d
JP SECTRAN         ;0xd230

; Environ specific codes jump table (infinite loop for emulator)
romCONST:  JP romCONST  ;0xd233
romCONIN:  JP romCONIN  ;0xd236
romCONOUT: JP romCONOUT ;0xd239
romREAD:   JP romREAD   ;0xd23c
romWRITE:  JP romWRITE  ;0xd23f

; CP/M BIOS routines
CBOOT:
	; On ROM address 0x0000, jump here.
	; Initialize 8255, initialize RAM 0x0000-0x0007, and continue to WBOOT routine.
	; Note that not RAM but ROM is selected from the address 0x0000
	; At the ROM address 0x0000, initializing disk emulation (SD card etc)
	; must be done.

	di
	ld sp,#bootStack

	; Initialize 8255
	; Mode 0 (for both group A and B)
	; Port A: input
	; Port B: input
	; Port C: output (for both upper and lower)
	ld a,#0x92
	out (3),a
	; Port C bits will be all 1 (ROM will be still chosen)
	ld a,#0xff
	out (2),a

	; Select RAM
	ld a,#0x02
	out (3),a

	; Initilize RAM 0x0000-0x0007
	ld a,#0xc3
	ld (#jWBOOT),a
	ld (#jBDOS),a
	ld hl,#ccpStart+0x1603
	ld (#jWBOOT+1),hl
	ld hl,#ccpStart+0x0806
	ld (#jBDOS+1),hl
	xor a
	ld (IOBYTE),a

	; Select ROM
	ld a,#0x03
	out (3),a

	ld hl,#WELCOMEMSG
	call PRINTSTR
	jp WBOOT

WELCOMEMSG:
.ascii "*** CP/KM BIOS KM-2010  1952K bytes x 4 Drives ***"
.db 0

WBOOT:
	; Initialize stack and global variables
	di
	ld sp,#bootStack

	; Initialize 8255 (ROM will be still chosen)
	ld a,#0x92
	out (3),a
	ld a,#0xff
	out (2),a

	; Load CCP and BDOS
	; CPM.SYS contains CCP and BDOS and total 0x1600 (5632) bytes
	; This file is stored in drive A at track #0, sector #0-#43

	; Select drive A
	ld c,#0
	call SELDSK
	; Set track #0
	ld bc,#0x0000
	call SETTRK
	; Destination starts from CCP Address
	ld hl,#ccpStart
	; Sector # strats from 0x0000
	ld de,#0x0000
	
	WBOOT_LOOP:
		; Set sector #
		ld b,d
		ld c,e
		call SETSEC
		; Set destination address
		ld b,h
		ld c,l
		call SETDMA
		; Read from disk
		call READ
		; Check error
		dec a
		jr z,WBOOT_ERROR
		; Increment destination
		ld bc,#0x0080
		add hl,bc
		; Increment sector number
		inc de
		ld a,#0x2c ; # of sector is 44 (0x2c)
		cp e
	jr nz,WBOOT_LOOP
	
	; Select RAM
	ld a,#0x02
	out (3),a

	; Copy IOBYTE to C and jump to CCP
	ld a,(IOBYTE)
	ld c,a
	jp ccpStart
	
	WBOOT_ERROR:
		ld hl,#WBOOT_ERROR_STR
		call PRINTSTR
		WBOOT_ERROR_LOOP:
		jr WBOOT_ERROR_LOOP
	WBOOT_ERROR_STR:
		.ascii "Disk Read Error during loading CCP/BDOS"
		.db 0x00
CONST:
	; Store current SP and use BIOS stack area
	ld (#storeSP),sp
	ld sp,#biosStack
	; Use ROM in area from 0x0000
	call SELECTROM
	; Call ROM routine
	call romCONST
	; Use RAM in area from 0x0000
	call SELECTRAM
	; Restore SP and return
	ld sp,(#storeSP)
	ret
CONIN:
	ld (#storeSP),sp
	ld sp,#biosStack
	call SELECTROM
	call romCONIN
	call SELECTRAM
	ld sp,(#storeSP)
	ret
CONOUT:
	ld (#storeSP),sp
	ld sp,#biosStack
	call SELECTROM
	call romCONOUT
	call SELECTRAM
	ld sp,(#storeSP)
	ret
LIST:
	ret
PUNCH:
	ret
READER:
	ld a,#0x1a
	ret
HOME:
	ld (storeSP),hl
	ld hl,(#diskNum)
	dec l
	jr nz,HOME_NB
		; Drive B
		ld hl,#244
		jr HOME_DONE
	HOME_NB:
	dec l
	jr nz,HOME_NC
		; Drive C
		ld hl,#488
		jr HOME_DONE
	HOME_NC:
	dec l
	jr nz,HOME_ND
		; Drive D
		ld hl,#732
		jr HOME_DONE
	HOME_ND:
		; Drive A
		ld hl,#1
	HOME_DONE:
	ld (trackNum),hl
	ld hl,(storeSP)
	ret
SELDSK:
	ld (storeSP),a
	ld a,c
	dec c
	jr nz,SELDSK_LBL1
		; C==1
		; Select drive B
		ld hl,#dph1
		jr SELDSK_DONE
	SELDSK_LBL1:
	dec c
	jr nz,SELDSK_LBL2
		; C==2
		; Select drive C
		ld hl,#dph2
		jr SELDSK_DONE
	SELDSK_LBL2:
	dec c
	jr nz,SELDSK_LBL3
		; C==3
		; Select drive D
		ld hl,#dph3
		jr SELDSK_DONE
	SELDSK_LBL3:
		; Other C value (force C=0)
		; Select drive A
		xor a
		ld hl,#dph0
	SELDSK_DONE:
	ld (pDPH),hl
	ld c,a
	ld (diskNum),a
	ld a,(storeSP)
	ret
SETTRK:
	ld (storeSP),a
	ld a,c
	ld (trackNum),a
	ld a,b
	ld (trackNum+1),a
	ld a,(storeSP)
	ret
SETSEC:
	ld (storeSP),a
	ld a,c
	ld (sectorNum),a
	ld a,b
	ld (sectorNum+1),a
	ld a,(storeSP)
	ret
SETDMA:
	ld (storeSP),a
	ld a,c
	ld (dmAddress),a
	ld a,b
	ld (dmAddress+1),a
	ld a,(storeSP)
	ret
READ:
	ld (#storeSP),sp
	ld sp,#biosStack
	push hl
	push bc
	push de
	call SELECTROM
	; Call main routine
	; Pass HL as disk position # in total and get result in A
	; To calculate HL, get trackNum, shift to left 6 times, then add sectorNum
	ld hl,(sectorNum)
	ld d,h
	ld e,l
	ld hl,(trackNum)
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	add hl,de
	call romREAD
	call SELECTRAM
	; SKIP LDIR if error (A==1)
	cp #1
	jr z,READ_SKIP
	; Transfer read data from diskBuff to dmAddress
	ld hl,(dmAddress)
	ld d,h
	ld e,l
	ld hl,#diskBuff
	ld bc,#128
	ldir
	READ_SKIP:
	pop de
	pop bc
	pop hl
	ld sp,(#storeSP)
	ret
WRITE:
	ld (#storeSP),sp
	ld sp,#biosStack
	push hl
	push bc
	push de
	; Transfer writing data from dm Address to diskBuff
	ld hl,(dmAddress)
	ld de,#diskBuff
	ld bc,#128
	ldir
	; Call main routine
	; Pass HL as disk position # in total and get result in A
	; To calculate HL, get trackNum, shift to left 6 times, then add sectorNum
	ld hl,(sectorNum)
	ld d,h
	ld e,l
	ld hl,(trackNum)
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	sla l
	rl h
	add hl,de
	call SELECTROM
	call romWRITE
	call SELECTRAM
	pop de
	pop bc
	pop hl
	ld sp,(#storeSP)
	ret
LISTST:
	xor a
	ret
SECTRAN:
	ld h,b
	ld l,c
	ret
ret

PRINTSTR:
	ld c,(hl)
	xor a
	cp c
	ret z
	call CONOUT
	inc hl
	jr PRINTSTR

SELECTRAM:
	push af
	ld a,#0x02
	out (3),a
	pop af
	ret

SELECTROM:
	push af
	ld a,#0x03
	out (3),a
	pop af
	ret
*/
