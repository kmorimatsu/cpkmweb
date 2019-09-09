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
:0DFC000000000000000000000000006FFF89
:0CFC0D0000000000000087FC4BFC07FD1D
:0CFC190087FD6FFF00000000000087FC6A
:06FC25005AFC27FD01FE60
:0CFC2B006FFF00000000000087FC69FC77
:0CFC370047FD7BFE6FFF00000000000096
:06FC430087FC78FC67FD60
:0DFC4900F5FE4000040F00CB037F00C0005B
:0EFC5600200001004000040F00CF037F00C01B
:0EFC6400002000F4004000040F00CF037F00DA
:0DFC7200C0002000E8014000040F00CF0397
:08FC7F007F00C0002000DC0240
:01FEF500000C
:0AF20000C342F2C3AAF2C31CF3C319
:09F20A0031F3C346F3C35BF3C307
:09F213005CF3C35DF3C360F3C3B7
:09F21C0088F3C3B3F3C3C2F3C3CA
:09F22500D1F3C3E0F3C32DF4C3DF
:09F22E0074F4C376F4C333F2C397
:09F2370036F2C339F2C33CF2C304
:0EF240003FF2F33140FF3E92D3033EFFD30274
:0DF24E003E02D3033EC33200003205002112
:0DF25B0003F22201002106E4220600AF327A
:0DF2680003003E03D3032177F2CD7AF4C3F7
:0EF27500AAF22A2A2A2043502F4B4D2042494C
:0EF283004F53204B4D2D32303030202031398A
:0EF2910035324B20627974657320782034206A
:0DF29F00447269766573202A2A2A00F33133
:0DF2AC0040FF3E92D3033EFFD3020E00CD83
:0EF2B90088F3010000CDB3F32100DC1100004A
:0EF2C700424BCDC2F3444DCDD1F3CDE0F33D2B
:0EF2D500281501800009133E2CBB20E63E02E6
:0DF2E300D3033A03004FC300DC21F4F2CD49
:0EF2F0007AF418FE4469736B20526561642045
:0EF2FE004572726F7220647572696E67206CC3
:0EF30C006F6164696E67204343502F42444F87
:0DF31A005300ED7300FC3180FFCD8BF4CD6E
:0CF3270033F2CD84F4ED7B00FCC9ED73E3
:0CF3330000FC3180FFCD8BF4CD36F2CD14
:0EF33F0084F4ED7B00FCC9ED7300FC3180FF0F
:0BF34D00CD8BF4CD39F2CD84F4ED7BC4
:0EF3580000FCC9C9C93E1AC92200FC2A02FCE9
:0EF366002D200521F40018132D200521E801AB
:0EF37400180B2D200521DC02180321010022B8
:0EF3820003FC2A00FCC93200FC790D20052195
:0EF390001BFC18140D2005212BFC180C0D2061
:0EF39E0005213BFC1804AF210BFC2209FC4F9B
:0CF3AC003202FC3A00FCC93200FC79324D
:0BF3B80003FC783204FC3A00FCC93270
:0BF3C30000FC793205FC783206FC3AB1
:0CF3CE0000FCC93200FC793207FC7832E8
:0EF3DA0008FC3A00FCC9ED7300FC3180FFE531
:0EF3E800C5D5CD8BF42A05FC545D2A03FCCB61
:0EF3F60025CB14CB25CB14CB25CB14CB25CBAC
:0EF4040014CB25CB14CB25CB1419CD3CF2CD67
:0EF4120084F4FE01280D2A07FC545D2180FFC2
:0EF42000018000EDB0D1C1E1ED7B00FCC9ED33
:0DF42E007300FC3180FFE5C5D52A07FC11F5
:0DF43B0080FF018000EDB02A05FC545D2A21
:0EF4480003FCCB25CB14CB25CB14CB25CB144A
:0EF45600CB25CB14CB25CB14CB25CB1419CD55
:0DF464008BF4CD3FF2CD84F4D1C1E1ED7BFE
:0EF4710000FCC9AFC96069C9C94EAFB9C8CDAA
:0EF47F0046F32318F6F53E02D303F1C9F53E1D
:05F48D0003D303F1C9E7
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
	ld de,f200
	ld bc,0e00
	ldir
	jp f200
	*/
	var a=[
	0x21,0x00,0x72,0x11,0x00,0xf2,0x01,0x00,0x0e,0xed,0xb0,0xc3,0x00,0xf2
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
			this.rom[addr+j-0x8000]=b;
		}
		// Checksum is ignored.
	}
};
/*
; This file can be assembled by SDCC:
; sdasz80 -o %1
; sdcc *.rel -mz80 --code-loc 0xf200 --data-loc 0xfc00 --no-std-crt0

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
; Data area is 0xFC00-0xFF7F, including stack area.
; 0xFF80-0xFFFF (128 bytes) is used for buffer for disk read/write
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
ccpStart   =0xdc00  ; Using 62K system
bootStack  =0xFF40  ; Stark area for BOOT is from 0xFF00 and to 0xFF3F
biosStack  =0xFF80  ; Stack area for BIOS is from 0xFF00 and to 0xFF7F
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
JP CBOOT           ;0xf200
JP WBOOT           ;0xf203
JP CONST           ;0xf206
JP CONIN           ;0xf209
JP CONOUT          ;0xf20c
JP LIST            ;0xf20f
JP PUNCH           ;0xf212
JP READER          ;0xf215
JP HOME            ;0xf218
JP SELDSK          ;0xf21b
JP SETTRK          ;0xf21e
JP SETSEC          ;0xf221
JP SETDMA          ;0xf224
JP READ            ;0xf227
JP WRITE           ;0xf22a
JP LISTST          ;0xf22d
JP SECTRAN         ;0xf230

; Environ specific codes jump table (infinite loop for emulator)
romCONST:  JP romCONST  ;0xf233
romCONIN:  JP romCONIN  ;0xf236
romCONOUT: JP romCONOUT ;0xf239
romREAD:   JP romREAD   ;0xf23c
romWRITE:  JP romWRITE  ;0xf23f

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
.ascii "*** CP/KM BIOS KM-2000  1952K bytes x 4 Drives ***"
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
	; Destination starts from 0xdc00
	ld hl,#0xdc00
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
