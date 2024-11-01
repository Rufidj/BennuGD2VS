

//-----------------------------------------------//

const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const which = require('which');

let outputChannel = vscode.window.createOutputChannel('BennuGD Compiler');
let diagnostics = vscode.languages.createDiagnosticCollection("bennugd2");

// Lista de funciones para autocompletado y ayuda de firma
const functions = [
    { label: 'CD', parameters: [], return_type: 'STRING' },
    { label: 'CD', parameters: ['STRING DIR'], return_type: 'INT',parameterDetails: [
        "DIRECTORY NAME"
    ] },
    { label: 'CHDIR', parameters: ['STRING DIR'], return_type: 'INT',parameterDetails: [
        "DIRECTORY NAME"
    ] },
    { label: 'MKDIR', parameters: ['STRING DIR'], return_type: 'INT',parameterDetails: [
        "DIRECTORY NAME"
    ] },
    { label: 'RMDIR', parameters: ['STRING DIR'], return_type: 'INT',parameterDetails: [
        "DIRECTORY NAME"
    ] },
    { label: 'GLOB', parameters: ['STRING PATTERN'], return_type: 'STRING',parameterDetails: [
        "PATTERN SEARCH"
    ] },
    { label: 'RM', parameters: ['STRING FILE'], return_type: 'INT',parameterDetails: [
        "FILE TO DELETE"
    ] },
    { label: 'DIROPEN', parameters: ['STRING DIR'], return_type: 'INT',parameterDetails: [
        "DIRECTORY TO OPEN"
    ] },
    { label: 'DIRCLOSE', parameters: ['INT IDDIR'], return_type: 'INT',parameterDetails: [
        "ID DIRECTORY TO CLOSE"
    ] },
    { label: 'DIRREAD', parameters: ['INT IDDIR'], return_type: 'STRING',parameterDetails: [
        "ID DIRECTORY TO READ"
    ] },
    { label: 'GET_BASE_PATH', parameters: [], return_type: 'STRING' },
    { label: 'GET_PREF_PATH', parameters: ['STRING ORG', 'STRING APP'], return_type: 'STRING',parameterDetails: [
        "ORGANIZATION",
        "APP NAME"
    ] },
    { label: 'SAVE', parameters: ['STRING FILE', 'VARIABLE'], return_type: 'INT',parameterDetails: [
        "FILENAME TO SAVE",
        "VARIABLE TO SAVE"
    ] },
    { label: 'LOAD', parameters: ['STRING FILE', 'VARIABLE'], return_type: 'INT',parameterDetails: [
        "FILENAME TO LOAD",
        "VARIABLE TO LOAD"
    ] },
    { label: 'FILE', parameters: ['STRING FILE'], return_type: 'STRING' },
    { label: 'FOPEN', parameters: ['STRING FILE', 'INT MODE'], return_type: 'INT',parameterDetails: [
        "FILE TO OPEN",
        "MODE"
    ] },
    { label: 'FCLOSE', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "ID FILE TO CLOSE"
    ] },
    { label: 'FREAD', parameters: ['INT FILE', 'VARIABLE'], return_type: 'INT',parameterDetails: [
        "ID FILE TO READ",
        "VARIABLE TO READ"
    ] },
    { label: 'FREAD', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FWRITE', parameters: ['INT FILE', 'VARIABLE'], return_type: 'INT',parameterDetails: [
        "ID FILE TO WRITE",
        "VARIABLE TO WRITE"
    ] },
    { label: 'FWRITE', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FSEEK', parameters: ['INT FILE', 'INT OFFSET', 'INT ORIGIN'], return_type: 'INT',parameterDetails: [
        "ID FILE",
        "OFFSET IN BYTES",
        "ORIGINAL POSITION"
    ] },
    { label: 'FREWIND', parameters: ['INT FILE'], return_type: 'UNDEFINED',parameterDetails: [
        "ID FILE TO REWIND"
    ] },
    { label: 'FTELL', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "ID FILE"
    ] },
    { label: 'FFLUSH', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "ID FILE"
    ] },
    { label: 'FPUTS', parameters: ['IN FILE', 'STRING TEXT'], return_type: 'INT',parameterDetails: [
        "ID FILE TO PUT",
        "TEXT TO PUT"
    ] },
    { label: 'FGETS', parameters: ['INT FILE'], return_type: 'STRING',parameterDetails: [
        "ID FILE TO GET"
    ] },
    { label: 'FEOF', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "ID FILE"
    ] },
    { label: 'FLENGTH', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "ID FILE"
    ] },
    { label: 'FEXISTS', parameters: ['STRING FILE'], return_type: 'INT',parameterDetails: [
        "FILE TO SEE IF IT EXISTS"
    ] },
    { label: 'FREMOVE', parameters: ['STRING FILE'], return_type: 'INT',parameterDetails: [
        "FILE TO REMOVE"
    ] },
    { label: 'FMOVE', parameters: ['STRING FILE SRC', 'STRING FILE DEST'], return_type: 'INT',parameterDetails: [
        "FILE ORIGINAL SOURCE",
        "FILE DESTINATION"
    ] },
    { label: 'MAX', parameters: ['DOUBLE VALUE1', 'DOUBLE VALUE2'], return_type: 'DOUBLE',parameterDetails: [
        "VALUE NUMBER",
        "VALUE NUMBER"
    ] },
    { label: 'MIN', parameters: ['DOUBLE VALUE1', 'DOUBLE VALUE2'], return_type: 'DOUBLE',parameterDetails: [
        "VALUE NUMBER",
        "VALUE NUMBER"
    ] },
    { label: 'SGN', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'SGN', parameters: ['INT'], return_type: 'INT' },
    { label: 'ROUND', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'FLOOR', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'CEIL', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'TRUNC', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'FRAC', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'DECIMAL', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'RAD', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'DEG', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'ABS', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'EXP', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'LOG', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'LOG10', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'POW', parameters: ['DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'SQRT', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'FMOD', parameters: ['DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'MMOD', parameters: ['DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'MODULUS', parameters: ['DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'COS', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'SIN', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'TAN', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'ACOS', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'ASIN', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'ATAN', parameters: ['DOUBLE'], return_type: 'DOUBLE' },
    { label: 'ATAN2', parameters: ['DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'ISINF', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'ISNAN', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'FINITE', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'INTERSECT', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2', 'DOUBLE X3', 'DOUBLE Y3', 'DOUBLE X4', 'DOUBLE Y4', 'POINTER', 'POINTER'], return_type: 'INT', parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2",
        "POSITION X3",
        "POSITION Y3",
        "POSITION X4",
        "POSITION POINTER X",
        "POSITION POINTER Y"
    ] },
    { label: 'INTERSECT_LINE_CIRCLE', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2', 'DOUBLE CX', 'DOUBLE CY', 'DOUBLE R', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT',parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2",
        "POSITION X3",
        "POSITION Y3",
        "POSITION X4",
        "POSITION POINTER X",
        "POSITION POINTER Y",
        "POSITION POINTER X1",
        "POSITION POINTER X2"
    ] },
    { label: 'INTERSECT_CIRCLE', parameters: ['DOUBLE CX1', 'DOUBLE CY1', 'DOUBLE CX2', 'DOUBLE CY2', 'DOUBLE R1', 'DOUBLE R2', 'POINTER X', 'POINTER Y', 'POINTER X1', 'POINTER Y2'], return_type: 'INT',parameterDetails: [
        "POSITION CX1",
        "POSITION CY1",
        "POSITION CX2",
        "POSITION CY2",
        "POSITION R1",
        "POSITION R2",
        "POSITION POINTER X",
        "POSITION POINTER Y",
        "POSITION POINTER X1",
        "POSITION POINTER Y2"
    ] },
    { label: 'ORTHO', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2', 'DOUBLE PX', 'DOUBLE PY', 'POINTER X', 'POINTER Y'], return_type: 'DOUBLE',parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2",
        "POSITION PX",
        "POSITION PY",
        "POSITION POINTER X",
        "POSITION POINTER Y"
    ] },
    { label: 'PROJECT', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2', 'DOUBLE PX', 'DOUBLE PY', 'POINTER X', 'POINTER Y'], return_type: 'DOUBLE',parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2",
        "POSITION PX",
        "POSITION PY",
        "POSITION POINTER X",
        "POSITION POINTER Y"
    ] },
    { label: 'FGET_ANGLE', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2'], return_type: 'INT',parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2"
    ] },
    { label: 'FGET_DIST', parameters: ['DOUBLE X1', 'DOUBLE Y1', 'DOUBLE X2', 'DOUBLE Y2'], return_type: 'DOUBLE',parameterDetails: [
        "POSITION X1",
        "POSITION Y1",
        "POSITION X2",
        "POSITION Y2"
    ] },
    { label: 'DISTANCE', parameters: ['DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'DIST', parameters: ['DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'NEAR_ANGLE', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'GET_DISTX', parameters: ['INT', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'GET_DISTY', parameters: ['INT', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'MAG', parameters: ['DOUBLE DX', 'DOUBLE DY'], return_type: 'DOUBLE' },
    { label: 'CLAMP', parameters: ['DOUBLE MIN', 'DOUBLE IDEAL', 'DOUBLE MAX'], return_type: 'DOUBLE' },
    { label: 'CLAMP', parameters: ['INT MIN', 'INT IDEAL', 'INT MAX'], return_type: 'INT' },
    { label: 'BETWEEN', parameters: ['DOUBLE VALUE', 'DOUBLE MIN', 'DOUBLE MAX'], return_type: 'INT' },
    { label: 'BETWEEN', parameters: ['INT VALUE', 'INT MIN', 'INT MAX'], return_type: 'INT' },
    { label: 'TOWARDS', parameters: ['DOUBLE FROM', 'DOUBLE ABS STEP', 'DOUBLE NEW VALUE'], return_type: 'DOUBLE' },
    { label: 'TOWARDS', parameters: ['INT FROM', 'INT ABS STEP', 'INT NEW VALUE'], return_type: 'INT' },
    { label: 'WRAP', parameters: ['INT VALUE', 'INT MIN', 'INT MAX'], return_type: 'INT' },
    { label: 'LERP', parameters: ['DOUBLE START', 'DOUBLE STOP', 'DOUBLE AMT'], return_type: 'DOUBLE' },
    { label: 'INVLERP', parameters: ['DOUBLE START', 'DOUBLE STOP', 'DOUBLE VALUE'], return_type: 'DOUBLE' },
    { label: 'RANGECHK', parameters: ['DOUBLE VALUE', 'DOUBLE LOW', 'DOUBLE HIGHT'], return_type: 'INT' },
    { label: 'RANGECHK', parameters: ['INT VALUE', 'INT LOW', 'INT HIGHT'], return_type: 'INT' },
    { label: 'REMAP', parameters: ['DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE', 'DOUBLE'], return_type: 'DOUBLE' },
    { label: 'REMAP', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'NORMALIZE', parameters: ['DOUBLE VALUE', 'DOUBLE MIN', 'DOUBLE MAX'], return_type: 'DOUBLE' },
    { label: 'NORMALIZE', parameters: ['INT VALUE', 'INT MIN', 'INT MAX'], return_type: 'DOUBLE' },
    { label: 'MEM_CALLOC', parameters: ['INT NUMBER', 'INT SIZE'], return_type: 'POINTER' },
    { label: 'MEM_ALLOC', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'MEM_FREE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEM_REALLOC', parameters: ['POINTER', 'INT'], return_type: 'POINTER' },
    { label: 'MEM_CMP', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEM_SET', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEM_SETW', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEM_SETD', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEM_SETI', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEM_COPY', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEM_MOVE', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEM_AVAILABLE', parameters: [], return_type: 'INT' },
    { label: 'MEM_TOTAL', parameters: [], return_type: 'INT' },
    { label: 'CALLOC', parameters: ['INT', 'INT'], return_type: 'POINTER' },
    { label: 'ALLOC', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'FREE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'REALLOC', parameters: ['POINTER', 'INT'], return_type: 'POINTER' },
    { label: 'MEMCMP', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEMSET', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEMSETW', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEMSETD', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEMSETI', parameters: ['POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MEMCOPY', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEMMOVE', parameters: ['POINTER', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEMORY_FREE', parameters: [], return_type: 'INT' },
    { label: 'MEMORY_TOTAL', parameters: [], return_type: 'INT' },
    { label: 'GET_ID', parameters: ['INT VALUE'], return_type: 'INT' },
    { label: 'GET_TYPE', parameters: ['INT VALUE'], return_type: 'INT' },
    { label: 'GET_STATUS', parameters: ['INT VALUE'], return_type: 'QWORD' },
    { label: 'SIGNAL', parameters: ['INT ID', 'INT TYPE'], return_type: 'INT' },
    { label: 'SIGNAL_ACTION', parameters: ['INT ID', 'INT TYPE'], return_type: 'INT' },
    { label: 'SIGNAL_ACTION', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'LET_ME_ALONE', parameters: [], return_type: 'INT' },
    { label: 'EXIT', parameters: ['STRING MSG', 'INT VALUE'], return_type: 'INT' },
    { label: 'EXIT', parameters: ['STRING MSG'], return_type: 'INT' },
    { label: 'EXIT', parameters: [], return_type: 'INT' },
    { label: 'EXISTS', parameters: ['INT VALUE'], return_type: 'INT' },
    { label: 'PAUSE', parameters: [], return_type: 'INT' },
    { label: 'RESUME', parameters: [], return_type: 'INT' },
    { label: 'RAND_SEED', parameters: ['INT VALUE'], return_type: 'INT' },
    { label: 'RAND', parameters: ['INT MIN', 'INT MAX'], return_type: 'INT' },
    { label: 'REGEX', parameters: ['STRING', 'STRING'], return_type: 'INT' },
    { label: 'REGEX_REPLACE', parameters: ['STRING', 'STRING', 'STRING'], return_type: 'STRING' },
    { label: 'SPLIT', parameters: ['STRING', 'STRING', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'JOIN', parameters: ['STRING', 'POINTER', 'INT'], return_type: 'STRING' },
    { label: 'SAY', parameters: ['STRING VALUE'], return_type: 'UNDEFINED' },
    { label: 'SAY_FAST', parameters: ['STRING'], return_type: 'UNDEFINED' },
    { label: 'ISORT', parameters: ['POINTER', 'INT', 'INT', 'INT', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'KSORT', parameters: ['VARIABLE', 'VARIABLE'], return_type: 'INT' },
    { label: 'KSORT', parameters: ['VARIABLE', 'VARIABLE', 'INT'], return_type: 'INT' },
    { label: 'SORT', parameters: ['VARIABLE', 'INT'], return_type: 'INT' },
    { label: 'SORT', parameters: ['VARIABLE'], return_type: 'INT' },
    { label: 'STRLEN', parameters: ['STRING'], return_type: 'INT' },
    { label: 'LEN', parameters: ['STRING'], return_type: 'INT' },
    { label: 'UCASE', parameters: ['STRING'], return_type: 'STRING' },
    { label: 'LCASE', parameters: ['STRING'], return_type: 'STRING' },
    { label: 'STRCASECMP', parameters: ['STRING', 'STRING'], return_type: 'INT' },
    { label: 'SUBSTR', parameters: ['STRING', 'INT', 'INT'], return_type: 'STRING' },
    { label: 'SUBSTR', parameters: ['STRING', 'INT'], return_type: 'STRING' },
    { label: 'FIND', parameters: ['STRING', 'STRING'], return_type: 'INT' },
    { label: 'FIND', parameters: ['STRING', 'STRING', 'INT'], return_type: 'INT' },
    { label: 'RFIND', parameters: ['STRING', 'STRING'], return_type: 'INT' },
    { label: 'RFIND', parameters: ['STRING', 'STRING', 'INT'], return_type: 'INT' },
    { label: 'STRTOK', parameters: ['STRING', 'STRING'], return_type: 'STRING' },
    { label: 'LPAD', parameters: ['STRING', 'INT'], return_type: 'STRING' },
    { label: 'RPAD', parameters: ['STRING', 'INT'], return_type: 'STRING' },
    { label: 'ITOA', parameters: ['INT'], return_type: 'STRING' },
    { label: 'FTOA', parameters: ['DOUBLE'], return_type: 'STRING' },
    { label: 'ATOI', parameters: ['STRING'], return_type: 'INT' },
    { label: 'ATOF', parameters: ['STRING'], return_type: 'DOUBLE' },
    { label: 'ASC', parameters: ['STRING'], return_type: 'BYTE' },
    { label: 'CHR', parameters: ['INT'], return_type: 'STRING' },
    { label: 'TRIM', parameters: ['STRING'], return_type: 'STRING' },
    { label: 'STRREV', parameters: ['STRING'], return_type: 'STRING' },
    { label: 'FORMAT', parameters: ['INT'], return_type: 'STRING' },
    { label: 'FORMAT', parameters: ['DOUBLE'], return_type: 'STRING' },
    { label: 'FORMAT', parameters: ['DOUBLE', 'INT'], return_type: 'STRING' },
    { label: 'GETENV', parameters: ['STRING'], return_type: 'STRING' },
    { label: 'EXEC', parameters: ['INT', 'STRING', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'GET_PREF_LANGUAGE', parameters: [], return_type: 'STRING' },
    { label: 'UPTIME', parameters: [], return_type: 'QWORD' },
    { label: 'GET_TIMER', parameters: [], return_type: 'QWORD' },
    { label: 'TIME', parameters: [], return_type: 'QWORD' },
    { label: 'FTIME', parameters: ['STRING', 'INT'], return_type: 'STRING' },
    { label: 'STRING_NEW_ARRAY', parameters: [], return_type: 'POINTER' },
    { label: 'STRING_NEW_ARRAY', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'STRING_RESIZE_ARRAY', parameters: ['POINTER', 'INT'], return_type: 'POINTER' },
    { label: 'STRING_DEL_ARRAY', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'STRING_SIZE_ARRAY', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'STRING_NEWA', parameters: [], return_type: 'POINTER' },
    { label: 'STRING_NEWA', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'STRING_RESIZEA', parameters: ['POINTER', 'INT'], return_type: 'POINTER' },
    { label: 'STRING_DELA', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'STRING_SIZEA', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'STRING_DUMP', parameters: [], return_type: 'INT' },
    { label: 'ISALPHA', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISSPACE', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISNUM', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISXNUM', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISALNUM', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISWORDCHAR', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'ISWORDFIRST', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'TOUPPER', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'TOLOWER', parameters: ['BYTE'], return_type: 'INT' },
    { label: 'LIST_CREATE', parameters: [], return_type: 'POINTER' },
    { label: 'LIST_CREATE', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'LIST_FREE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'LIST_EMPTY', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'LIST_INSERTITEM', parameters: ['POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'LIST_REMOVEITEM', parameters: ['POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'LIST_WALK', parameters: ['POINTER', 'POINTER'], return_type: 'POINTER' },
    { label: 'LIST_SIZE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'ADVANCE', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'XADVANCE', parameters: ['INT', 'DOUBLE'], return_type: 'INT' },
    { label: 'GET_ANGLE', parameters: ['INT'], return_type: 'INT' },
    { label: 'GET_ANGLE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'GET_DIST', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'GET_DIST', parameters: ['INT', 'INT'], return_type: 'DOUBLE' },
    { label: 'GET_REAL_POINT', parameters: ['INT', 'DOUBLE', 'DOUBLE', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'GET_REAL_POINT', parameters: ['INT', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'GET_REAL_POINT', parameters: ['INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'COLLISION', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'COLLISION', parameters: ['INT'], return_type: 'INT' },
    { label: 'SCROLL_START', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SCROLL_START', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SCROLL_START', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SCROLL_STOP', parameters: ['INT'], return_type: 'INT' },
    { label: 'SCROLL_MOVE', parameters: ['INT'], return_type: 'INT' },
    { label: 'REGION_DEFINE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'REGION_OUT', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SCREEN_GET', parameters: [], return_type: 'INT' },
    { label: 'RGB', parameters: ['BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'RGB', parameters: ['INT', 'INT', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'RGBA', parameters: ['BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'RGBA', parameters: ['INT', 'INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'RGB_GET', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'RGB_GET', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'RGBA_GET', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'RGBA_GET', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'FADE', parameters: ['INT RED', 'INT GREN', 'INT BLUE', 'INT ALPHA', 'INT DURATION'], return_type: 'INT', parameterDetails: [      
        "Color Red",
        "Color Green",
        "Color Blue",
        "Alpha level",
        "Duration effect"] },
    { label: 'FADE', parameters: ['INT RED', 'INT GREN', 'INT BLUE', 'INT ALPHA', 'INT DURATION', 'INT REGION'], return_type: 'INT', parameterDetails: [
        "Color Red",
        "Color Green",
        "Color Blue",
        "Alpha level",
        "Duration effect",
        "Region effect"] },
    { label: 'FADE_ON', parameters: ['INT'], return_type: 'INT' },
    { label: 'FADE_ON', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'FADE_OFF', parameters: ['INT'], return_type: 'INT' },
    { label: 'FADE_OFF', parameters: ['INT IN', 'INT OUT'], return_type: 'INT' },
    { label: 'SET_MODE', parameters: ['INT WIDTH', 'INT HEIGHT'], return_type: 'INT', parameterDetails: [
        "SCREEN width",
        "SCREEN height"
        ], },
    { label: 'SET_MODE', parameters: ['INT WIDTH', 'INT HEIGHT', 'INT FLAG'], return_type: 'INT', parameterDetails: [
        "SCREEN width",
        "SCREEN height",
        "MODE FLAG"
    ] },
    { label: 'SET_FPS', parameters: ['INT FPS', 'INT JUMP'], return_type: 'INT', parameterDetails: [
        "FRAMES Per Second",
        "JUMP Frames"
    ] },
    { label: 'WINDOW_SET_TITLE', parameters: ['STRING TITLE'], return_type: 'INT', parameterDetails: [
        "WINDOW Title"
    ] },
    { label: 'WINDOW_SET_ICON', parameters: ['INT FILE', 'INT ID'], return_type: 'INT', parameterDetails:[
        "FILE ",
        "ID GRAPH"
    ] },
    { label: 'WINDOW_MOVE', parameters: ['INT X', 'INT Y'], return_type: 'INT', parameterDetails: [
        "WINDOW MOVE POSITION X",
        "WINDOW MOVE POSITION Y"
    ] },
    { label: 'WINDOW_SET_POS', parameters: ['INT X', 'INT Y'], return_type: 'INT', parameterDetails: [
        "WINDOW SET POS X",
        "WINDOW SET POS Y"
    ] },
    { label: 'WINDOW_GET_POS', parameters: ['POINTER X', 'POINTER Y'], return_type: 'INT', parameterDetails: [
        "WINDOW GET POS X",
        "WINDOW GET POS Y"
    ] },
    { label: 'WINDOW_GET_SIZE', parameters: ['POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'DESKTOP_GET_SIZE', parameters: ['POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'WINDOW_HIDE', parameters: [], return_type: 'INT' },
    { label: 'WINDOW_SHOW', parameters: [], return_type: 'INT' },
    { label: 'WINDOW_MINIMIZE', parameters: [], return_type: 'INT' },
    { label: 'WINDOW_MAXIMIZE', parameters: [], return_type: 'INT' },
    { label: 'WINDOW_RAISE', parameters: [], return_type: 'INT' },
    { label: 'WINDOW_RESTORE', parameters: [], return_type: 'INT' },
    { label: 'WRITE', parameters: ['INT FONT', 'INT X ', 'INT Y', 'INT ALINGN', 'STRING TEXT'], return_type: 'INT', parameterDetails: [
        "FILE FONT",
        "TEXT POSITION X",
        "TEXT POSITION Y",
        "TEXT ALIGNMENT",
        "TEXT"
    ] },
    { label: 'WRITE', parameters: ['INT FONT', 'INT X', 'INT Y', 'INT ALINGN', 'INT ?', 'STRING TEXT'], return_type: 'INT', parameterDetails: [
        "FILE FONT",
        "TEXT POSITION X",
        "TEXT POSITION Y",
        "TEXT ALIGNMENT",
        "¿?",
        "TEXT"
    ] },
    { label: 'WRITE_MOVE', parameters: ['INT IDTEXT', 'INT X', 'INT Y'], return_type: 'INT', parameterDetails: [
        "ID TEXT",
        "TEXT POSITION X",
        "TEXT POSITION Y"
    ] },
    { label: 'WRITE_MOVE', parameters: ['INT IDTEXT', 'INT X', 'INT Y', 'INT'], return_type: 'INT' },
    { label: 'WRITE_DELETE', parameters: ['INT IDTEXT'], return_type: 'INT', parameterDetails: [
        "ID TEXT TO DELETE"
    ] },
    { label: 'WRITE_IN_MAP', parameters: ['INT FONT', 'STRING TEXT', 'INT ALINGN'], return_type: 'INT', parameterDetails: [
        "ID FONT",
        "TEXT TO WRITE",
        "TEXT ALIGNMENT"
    ] },
    { label: 'WRITE_IN_MAP', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'STRING', 'INT'], return_type: 'INT' },
    { label: 'TEXT_WIDTH', parameters: ['INT', 'STRING'], return_type: 'INT' },
    { label: 'TEXT_HEIGHT', parameters: ['INT', 'STRING'], return_type: 'INT' },
    { label: 'WRITE_VAR', parameters: ['INT FONT', 'INT X', 'INT Y ', 'INT ALINGN', 'VARIABLE'], return_type: 'INT', parameterDetails: [
        "ID FONT",
        "TEXT POSITION X",
        "TEXT POSITION Y",
        "TEXT ALIGNMENT"
    ] },
    { label: 'WRITE_VAR', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'VARIABLE'], return_type: 'INT' },
    { label: 'WRITE_VALUE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'WRITE_VALUE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'WRITE_GET_RGBA', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'WRITE_SET_RGBA', parameters: ['INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'MAP_BLOCK_COPY', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_BLOCK_COPY', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'MAP_BLOCK_COPY', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE', 'INT'], return_type: 'INT' },
    { label: 'MAP_BLOCK_COPY', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_BLOCK_COPY', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_PUT', parameters: ['INT FILE', 'INT GRAPH DEST', 'INT FILE SRC', 'INT GRAPH SRC', 'INT X', 'INT Y'], return_type: 'INT', parameterDetails: [
        "FILE",
        "DESTINATION GRAPH",
        "FILE SOURCE",
        "SOURCE GRAPH",
        "POSITION X",
        "POSITION Y"
    ] },
    { label: 'MAP_PUT', parameters: ['INT FILE', 'INT GRAPH DEST', 'INT FILE SRC', 'INT GRAPH SRC', 'INT X', 'INT Y', 'INT ANGLE', 'INT SCALE_X', 'INT SCALE_Y', 'INT FLAGS', 'BYTE R', 'BYTE G', 'BYTE B', 'BYTE A'], return_type: 'INT', parameterDetails: [
        "FILE",
        "DESTINATION GRAPH",
        "FILE SOURCE",
        "SOURCE GRAPH",
        "POSITION X",
        "POSITION Y",
        "GRAPH ANGLE",
        "SCALE IN X",
        "SCALE IN Y",
        "GRAPH FLAGS",
        "COLOR RED",
        "COLOR GREEN",
        "COLOR BLUE",
        "ALPHA INTENSITY"
    ] },
    { label: 'MAP_PUT', parameters: ['INT FILE', 'INT GRAPH DEST', 'INT FILE SRC', 'INT GRAPH SRC', 'INT X', 'INT Y', 'INT ANGLE', 'INT SCALE_X', 'INT SCALE_Y', 'INT FLAGS', 'BYTE R', 'BYTE G', 'BYTE B', 'BYTE A', 'INT BLEND MODE'], return_type: 'INT',parameterDetails: [
        "FILE",
        "DESTINATION GRAPH",
        "FILE SOURCE",
        "SOURCE GRAPH",
        "POSITION X",
        "POSITION Y",
        "GRAPH ANGLE",
        "SCALE IN X",
        "SCALE IN Y",
        "GRAPH FLAGS",
        "COLOR RED",
        "COLOR GREEN",
        "COLOR BLUE",
        "ALPHA INTENSITY",
        "BLEND MODE"
    ] },
    { label: 'MAP_PUT', parameters: ['INT FILE", "INT GRAPH_DEST","INT FILE_SRC","INT GRAPH_SRC","INT X","INT Y","INT ANGLE","INT SCALE_X","INT SCALEY","INT FLAGS","BYTE R","BYTE G","BYTE B","BYTE A","INT BLEND_MODE","INT SRC_RGB","INT DST_RGB","INT SRC_ALPHA","INT DST_ALPHA","INT EQUATION_RGB","INT EQUATION_ALPHA"'], return_type: 'INT', parameterDetails: [
        "FILE",
        "DESTINATION GRAPH",
        "FILE SOURCE",
        "SOURCE GRAPH",
        "POSITION X",
        "POSITION Y",
        "GRAPH ANGLE",
        "SCALE IN X",
        "SCALE IN Y",
        "GRAPH FLAGS",
        "COLOR RED",
        "COLOR GREEN",
        "COLOR BLUE",
        "ALPHA INTENSITY",
        "BLEND MODE",
        "SOURCE RGB",
        "DESTINATION RGB",
        "SOURCE ALPHA",
        "DESTINATION ALPHA",
        "EQUATION RGB",
        "EQUATION ALPHA"
    ] },
    { label: 'MAP_NEW', parameters: ['INT WIDTH', 'INT HEIGHT'], return_type: 'INT',parameterDetails: [
        "MAP WIDTH",
        "MAP HEIGHT"
    ] },
    { label: 'MAP_NEW', parameters: ['INT WIDTH', 'INT HEIGHT', 'INT DEEP'], return_type: 'INT',parameterDetails: [
        "MAP WIDTH",
        "MAP HEIGHT",
        "MAP DEEP"
    ] },
    { label: 'MAP_CLEAR', parameters: ['INT FILE', 'INT GRAPH'], return_type: 'INT',parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH"
    ] },
    { label: 'MAP_CLEAR', parameters: ['INT FILE', 'INT GRAPH', 'INT COLOR'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "COLOR NUMBER"
    ] },
    { label: 'MAP_CLEAR', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_CLEAR', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_CLONE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'MAP_NAME', parameters: ['INT FILE', 'INT GRAPH'], return_type: 'STRING',parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER"
    ] },
    { label: 'MAP_SET_NAME', parameters: ['INT FILE', 'INT GRAPH', 'STRING NAME'], return_type: 'INT',parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "MAP NAME"
    ] },
    { label: 'MAP_EXISTS', parameters: ['INT FILE', 'INT GRAPH'], return_type: 'INT',parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER"
    ] },
    { label: 'MAP_DEL', parameters: ['INT FILE', 'INT GRAPH'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER"
    ] },
    { label: 'MAP_UNLOAD', parameters: ['INT FILE', 'INT GRAPH'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER"
    ] },
    { label: 'MAP_LOAD', parameters: ['STRING FILE'], return_type: 'INT', parameterDetails: [
        "GRAPHIC FILE"
    ] },
    { label: 'MAP_LOAD', parameters: ['STRING FILE', 'POINTER'], return_type: 'INT' },
    { label: 'MAP_SAVE', parameters: ['INT FILE', 'INT GRAPH', 'STRING FILESAVE'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "GRAPH TO SAVE"
    ] },
    { label: 'MAP_GET_PIXEL', parameters: ['INT FILE', 'INT GRAPH', 'INT X', 'INT Y'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "POSITION X",
        "POSITION Y"
    ] },
    { label: 'MAP_PUT_PIXEL', parameters: ['INT FILE', 'INT GRAPH', 'INT X', 'INT Y', 'INT COLOR'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "POSITION X",
        "POSTION Y",
        "COLOR NUMBER"
    ] },
    { label: 'FPG_ADD', parameters: ['INT FILE', 'INT GRAPH', 'INT FILE SRC', 'INT GRAPH SRC'], return_type: 'INT', parameterDetails: [
        "GRAPH LIBRARY",
        "GRAPH NUMBER",
        "LIBRARY SOURCE",
        "GRAPH SOURCE"
    ] },
    { label: 'FPG_NEW', parameters: [], return_type: 'INT' },
    { label: 'FPG_EXISTS', parameters: ['INT FILE'], return_type: 'INT',parameterDetails: [
        "FILE EXISTS"
    ] },
    { label: 'FPG_LOAD', parameters: ['STRING FILE'], return_type: 'INT',parameterDetails: [
        "FPG FILE"
    ] },
    { label: 'FPG_LOAD', parameters: ['STRING FILE', 'POINTER'], return_type: 'INT' },
    { label: 'FPG_DEL', parameters: ['INT FILE'], return_type: 'INT', parameterDetails: [
        "ID FPG FILE"
    ] },
    { label: 'FPG_UNLOAD', parameters: ['INT FILE'], return_type: 'INT', parameterDetails: [
        "ID FPG FILE"
    ] },
    { label: 'MAP_INFO_SET', parameters: ['INT FILE', 'INT GRAPH', 'INT TYPE', 'INT'], return_type: 'INT', parameterDetails: [
        "ID GRAPH LIBRARY",
        "GRAPH NUMBER",
        "TYPE INFO",
        "??"
    ] },
    { label: 'MAP_INFO', parameters: ['INT FILE', 'INT GRAPH', 'INT TYPE', 'INT'], return_type: 'INT',parameterDetails: [
        "ID GRAPH LIBRARY",
        "GRAPH NUMBER",
        "TYPE INFO",
        "??"
    ] },
    { label: 'MAP_INFO', parameters: ['INT FILE', 'INT GRAPH', 'INT TYPE'], return_type: 'INT', parameterDetails: [
        "ID GRAPH LIBRARY",
        "GRAPH NUMBER",
        "TYPE INFO"
    ] },
    { label: 'GRAPHIC_SET', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'GRAPHIC_INFO', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'POINT_GET', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'POINT_SET', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'CENTER_SET', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'POINT_GET_TOTAL', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'BOX_SET', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'BOX_SET', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'BOX_GET', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_GET', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_GET_BY_POS', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_GET_BY_POS', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_REMOVE', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'BOX_REMOVE', parameters: ['INT'], return_type: 'INT' },
    { label: 'BOX_GET_REAL_VERTEX', parameters: ['INT', 'INT', 'INT', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_GET_REAL_VERTEX', parameters: ['INT', 'INT', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'BOX_GET_REAL_VERTEX', parameters: ['INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: [], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'STRING'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'STRING'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'STRING', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_NEW', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'STRING', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'FNT_LOAD', parameters: ['STRING'], return_type: 'INT' },
    { label: 'FNT_LOAD', parameters: ['STRING', 'POINTER'], return_type: 'INT' },
    { label: 'FNT_UNLOAD', parameters: ['INT'], return_type: 'INT' },
    { label: 'GLYPH_GET', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'GLYPH_SET', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_COLOR', parameters: ['INT'], return_type: 'INT' },
    { label: 'DRAWING_COLOR', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_RGBA', parameters: ['BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'DRAWING_RGBA', parameters: ['INT', 'BYTE', 'BYTE', 'BYTE', 'BYTE'], return_type: 'INT' },
    { label: 'DRAWING_BLENDMODE', parameters: ['INT'], return_type: 'INT' },
    { label: 'DRAWING_BLENDMODE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_BLENDMODE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_BLENDMODE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_Z', parameters: [], return_type: 'INT' },
    { label: 'DRAWING_Z', parameters: ['INT'], return_type: 'INT' },
    { label: 'DRAWING_Z', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'DRAWING_MAP', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_DELETE', parameters: ['INT'], return_type: 'INT' },
    { label: 'DRAW_MOVE', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_COORDS', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'DRAW_POINT', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_POINT', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_LINE', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_LINE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CIRCLE', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CIRCLE', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CIRCLE_FILLED', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CIRCLE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CURVE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_CURVE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ARC', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ARC', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ARC_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ARC_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ELLIPSE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ELLIPSE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ELLIPSE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_ELLIPSE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_SECTOR', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_SECTOR', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_SECTOR_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_SECTOR_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_TRIANGLE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_TRIANGLE', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_TRIANGLE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_TRIANGLE_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_ROUND', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_ROUND', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_ROUND_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_RECTANGLE_ROUND_FILLED', parameters: ['INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_POLYGON', parameters: ['INT', 'POINTER'], return_type: 'INT' },
    { label: 'DRAW_POLYGON', parameters: ['INT', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'DRAW_POLYGON_FILLED', parameters: ['INT', 'POINTER'], return_type: 'INT' },
    { label: 'DRAW_POLYGON_FILLED', parameters: ['INT', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'DRAW_POLYLINE', parameters: ['INT', 'POINTER', 'INT'], return_type: 'INT' },
    { label: 'DRAW_POLYLINE', parameters: ['INT', 'POINTER', 'INT', 'INT'], return_type: 'INT' },
    { label: 'DRAW_SET_THICKNESS', parameters: ['FLOAT'], return_type: 'FLOAT' },
    { label: 'DRAW_SET_THICKNESS', parameters: ['INT', 'FLOAT'], return_type: 'FLOAT' },
    { label: 'DRAW_GET_THICKNESS', parameters: [], return_type: 'FLOAT' },
    { label: 'DRAW_GET_THICKNESS', parameters: ['INT'], return_type: 'FLOAT' },
    { label: 'PATH_NEW', parameters: ['INT', 'INT'], return_type: 'POINTER' },
    { label: 'PATH_DESTROY', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'PATH_FIND', parameters: ['POINTER', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'POINTER' },
    { label: 'PATH_FIND', parameters: ['POINTER', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'POINTER' },
    { label: 'PATH_FREE_RESULTS', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'TEXTURE_SET_QUALITY', parameters: ['INT'], return_type: 'INT' },
    { label: 'MAP_SET_PALETTE', parameters: ['INT', 'INT', 'INT', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'MAP_GET_PALETTE', parameters: ['INT', 'INT', 'INT', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'SHADER_GET_LANGUAGE', parameters: [], return_type: 'INT' },
    { label: 'SHADER_GET_MIN_VERSION', parameters: [], return_type: 'INT' },
    { label: 'SHADER_GET_MAX_VERSION', parameters: [], return_type: 'INT' },
    { label: 'SHADER_CREATE', parameters: ['STRING', 'STRING'], return_type: 'POINTER' },
    { label: 'SHADER_FREE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'SHADER_GET_PARAM_LOCATION', parameters: ['POINTER', 'STRING'], return_type: 'INT' },
    { label: 'SHADER_CREATE_PARAMS', parameters: ['INT'], return_type: 'POINTER' },
    { label: 'SHADER_FREE_PARAMS', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'SHADER_SET_PARAM', parameters: ['POINTER', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SHADER_SET_PARAM', parameters: ['POINTER', 'INT', 'INT', 'FLOAT'], return_type: 'INT' },
    { label: 'SHADER_SET_PARAM', parameters: ['POINTER', 'INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SHADER_SET_PARAM', parameters: ['POINTER', 'INT', 'INT', 'INT', 'POINTER'], return_type: 'INT' },
    { label: 'SHADER_SET_PARAM', parameters: ['POINTER', 'INT', 'INT', 'POINTER', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SHADER_GET_PARAM', parameters: ['POINTER', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'SHADER_GET_PARAM', parameters: ['POINTER', 'INT', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'SHADER_GET_PARAM', parameters: ['POINTER', 'INT', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'MEDIA_LOAD', parameters: ['STRING', 'POINTER'], return_type: 'POINTER' },
    { label: 'MEDIA_LOAD', parameters: ['STRING', 'POINTER', 'INT'], return_type: 'POINTER' },
    { label: 'MEDIA_UNLOAD', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_PLAY', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_PAUSE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_PAUSE', parameters: ['POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEDIA_RESUME', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_STOP', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_GET_TIME', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_GET_DURATION', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_GET_STATUS', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_GET_MUTE', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_SET_MUTE', parameters: ['POINTER', 'INT'], return_type: 'INT' },
    { label: 'MEDIA_GET_VOLUME', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MEDIA_SET_VOLUME', parameters: ['POINTER', 'INT'], return_type: 'INT' },
    { label: 'SOUNDSYS_INIT', parameters: [], return_type: 'INT' },
    { label: 'SOUNDSYS_QUIT', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_LOAD', parameters: ['STRING'], return_type: 'INT' },
    { label: 'MUSIC_LOAD', parameters: ['STRING', 'POINTER'], return_type: 'INT' },
    { label: 'MUSIC_UNLOAD', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_UNLOAD', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'MUSIC_PLAY', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'MUSIC_PLAY', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_STOP', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_PAUSE', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_RESUME', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_REWIND', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_FADE_IN', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'MUSIC_FADE_IN', parameters: ['INT', 'INT', 'INT', 'DOUBLE'], return_type: 'INT' },
    { label: 'MUSIC_FADE_OFF', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_IS_PLAYING', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_IS_PAUSED', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_IS_FADING', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_SET_VOLUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_GET_VOLUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_SET_PLAYBACK_POSITION', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'MUSIC_SET_TIME_POSITION', parameters: ['DOUBLE'], return_type: 'INT' },
    { label: 'MUSIC_GET_PLAYBACK_POSITION', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_TIME_POSITION', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_DURATION', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_DURATION', parameters: [], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_START', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_START', parameters: [], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_END', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_END', parameters: [], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_LEN', parameters: ['INT'], return_type: 'DOUBLE' },
    { label: 'MUSIC_GET_LOOP_LEN', parameters: [], return_type: 'DOUBLE' },
    { label: 'SOUND_LOAD', parameters: ['STRING'], return_type: 'INT' },
    { label: 'SOUND_LOAD', parameters: ['STRING', 'POINTER'], return_type: 'INT' },
    { label: 'SOUND_UNLOAD', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_UNLOAD', parameters: ['POINTER'], return_type: 'INT' },
    { label: 'SOUND_PLAY', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_PLAY', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_PLAY', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_PLAY', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_STOP', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_PAUSE', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_RESUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_FADE_IN', parameters: ['INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_FADE_IN', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_FADE_OFF', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_IS_PLAYING', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_IS_PAUSED', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_IS_FADING', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_SET_VOLUME', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_SET_VOLUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_SET_LOCATION', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_SET_SPATIAL_POSITION', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SET_POSITION', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_EXPIRE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_EXPIRE', parameters: ['INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_VOLUME', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_VOLUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'SET_MASTER_VOLUME', parameters: ['INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_PANNING', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SET_PANNING', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'CHANNEL_SET_DISTANCE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SET_DISTANCE', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'RESERVE_CHANNELS', parameters: ['INT'], return_type: 'INT' },
    { label: 'REVERSE_STEREO', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'GET_NUM_MUSIC_DECODERS', parameters: [], return_type: 'INT' },
    { label: 'GET_MUSIC_DECODER', parameters: ['INT'], return_type: 'STRING' },
    { label: 'HAS_MUSIC_DECODER', parameters: ['STRING'], return_type: 'INT' },
    { label: 'MUSIC_GET_TYPE', parameters: ['INT'], return_type: 'INT' },
    { label: 'MUSIC_GET_TITLE', parameters: ['INT'], return_type: 'STRING' },
    { label: 'MUSIC_GET_TITLE_TAG', parameters: ['INT'], return_type: 'STRING' },
    { label: 'MUSIC_GET_ARTIST_TAG', parameters: ['INT'], return_type: 'STRING' },
    { label: 'MUSIC_GET_ALBUM_TAG', parameters: ['INT'], return_type: 'STRING' },
    { label: 'MUSIC_GET_COPYRIGHT_TAG', parameters: ['INT'], return_type: 'STRING' },
    { label: 'MUSIC_GET_TYPE', parameters: [], return_type: 'INT' },
    { label: 'MUSIC_GET_TITLE', parameters: [], return_type: 'STRING' },
    { label: 'MUSIC_GET_TITLE_TAG', parameters: [], return_type: 'STRING' },
    { label: 'MUSIC_GET_ARTIST_TAG', parameters: [], return_type: 'STRING' },
    { label: 'MUSIC_GET_ALBUM_TAG', parameters: [], return_type: 'STRING' },
    { label: 'MUSIC_GET_COPYRIGHT_TAG', parameters: [], return_type: 'STRING' },
    { label: 'SOUND_GROUP_CHANNEL', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_CHANNELS', parameters: ['INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_AVAILABLE', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_COUNT', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_OLDEST', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_NEWER', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_HALT', parameters: ['INT'], return_type: 'INT' },
    { label: 'SOUND_GROUP_FADE_OUT', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'TRACE', parameters: ['INT'], return_type: 'INT' },
    { label: 'KEY', parameters: ['INT'], return_type: 'INT' },
    { label: 'KEYUP', parameters: ['INT'], return_type: 'INT' },
    { label: 'KEY_UP', parameters: ['INT'], return_type: 'INT' },
    { label: 'KEYDOWN', parameters: ['INT'], return_type: 'INT' },
    { label: 'KEY_DOWN', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NAME', parameters: [], return_type: 'STRING' },
    { label: 'JOY_NAME', parameters: ['INT'], return_type: 'STRING' },
    { label: 'JOY_SELECT', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NUMBER', parameters: [], return_type: 'INT' },
    { label: 'JOY_NUMJOYSTICKS', parameters: [], return_type: 'INT' },
    { label: 'JOY_BUTTONS', parameters: [], return_type: 'INT' },
    { label: 'JOY_BUTTONS', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NUMBUTTONS', parameters: [], return_type: 'INT' },
    { label: 'JOY_NUMBUTTONS', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_AXES', parameters: [], return_type: 'INT' },
    { label: 'JOY_AXES', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NUMAXES', parameters: [], return_type: 'INT' },
    { label: 'JOY_NUMAXES', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NUMHATS', parameters: [], return_type: 'INT' },
    { label: 'JOY_NUMHATS', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_NUMBALLS', parameters: [], return_type: 'INT' },
    { label: 'JOY_NUMBALLS', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_GETAXIS', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_GETAXIS', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'JOY_GETPOSITION', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_GETPOSITION', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'JOY_GETBUTTON', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_GETBUTTON', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'JOY_GETHAT', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_GETHAT', parameters: ['INT', 'INT'], return_type: 'INT' },
    { label: 'JOY_GETBALL', parameters: ['INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'JOY_GETBALL', parameters: ['INT', 'INT', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'JOY_GETACCEL', parameters: ['POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'JOY_GETACCEL', parameters: ['INT', 'POINTER', 'POINTER', 'POINTER'], return_type: 'INT' },
    { label: 'JOY_IS_ATTACHED', parameters: [], return_type: 'INT' },
    { label: 'JOY_IS_ATTACHED', parameters: ['INT'], return_type: 'INT' },
    { label: 'JOY_QUERY', parameters: ['INT JOY'], return_type: 'INT',parameterDetails: [
        "JOY SELECTED"
    ] },
    { label: 'JOY_QUERY', parameters: ['INT JOY', 'INT ELEMENT'], return_type: 'INT',parameterDetails: [
        "JOY SELECTED",
        "ELEMENT"
    ] },
    { label: 'JOY_QUERY', parameters: ['INT JOY', 'INT ELEMENT', 'INT ARG1'], return_type: 'INT', parameterDetails: [
        "JOY SELECTED",
        "ELEMENT",
        "ARGUMENT"
    ] },
    { label: 'JOY_SET', parameters: ['INT JOY', 'INT ELEMENT', 'INT ARG1', 'INT ARG2'], return_type: 'INT',parameterDetails: [
        "JOY SELECTED",
        "ELEMENT"
    ] },
    { label: 'JOY_SET', parameters: ['INT', 'INT', 'INT', 'INT', 'INT'], return_type: 'INT' },
    { label: 'NUMBER_JOY', parameters: [], return_type: 'INT' },
    { label: 'SELECT_JOY', parameters: ['INT JOY'], return_type: 'INT',parameterDetails: [
        "JOY SELECTED"
    ] },
    { label: 'GET_JOY_BUTTON', parameters: ['INT BUTTON'], return_type: 'INT',parameterDetails: [
        "BUTTON PRESSED"
    ] },
    { label: 'GET_JOY_BUTTON', parameters: ['INT JOYSTICK', 'INT BUTTON'], return_type: 'INT',parameterDetails: [
        "JOYSTICK",
        "BUTTON PRESSED"
    ] },
    { label: 'GET_JOY_POSITION', parameters: ['INT AXIS'], return_type: 'INT',parameterDetails: [
        "JOYSTICK DIRECTION (0/1)"
    ] },
    { label: 'GET_JOY_POSITION', parameters: ['INT JOYSTICK', 'INT AXIS'], return_type: 'INT',parameterDetails: [
        "JOYSTICK",
        "JOYSTICK DIRECTION (0/1)"
    ] },
    { label: 'NET_OPEN', parameters: ['INT MODE', 'INT PROTO', 'STRING ADDR', 'INT PORT'], return_type: 'POINTER',parameterDetails: [
        "NETWORK MODE (SERVER/CLIENT)",
        "NETWORK PROTOCOL (TCP/UDP)",
        "ADDRESS TO CONNECT (OPTIONAL)",
        "PORT TO CONNECT"
    ] },
    { label: 'NET_WAIT', parameters: ['POINTER SOCK', 'INT TIMEOUT', 'POINTER EVENTS'], return_type: 'INT',parameterDetails: [
        "LISTS OF SOCKETS TO WAIT ON",
        "TIMEOUT OF MILISECONS",
        "LISTS OF EVENTS"
    ] },
    { label: 'NET_SEND', parameters: ['POINTER NETH', 'POINTER BUF', 'INT LEN'], return_type: 'INT',parameterDetails: [
        "POINTER TO THE NETWORK CONNECTION",
        "BUFFER TO STORE RECEIVED DATA",
        "LENGTH OF THE BUFFER"
    ] },
    { label: 'NET_RECV', parameters: ['POINTER NETH', 'POINTER BUF', 'INT LEN'], return_type: 'INT',parameterDetails: [
        "POINTER TO THE NETWORK CONNECTION",
        "BUFFER TO STORE RECEIVED DATA",
        "LENGTH OF THE BUFFER"   
    ] },
    { label: 'NET_CLOSE', parameters: ['POINTER NETH'], return_type: 'INT',parameterDetails: [
        "POINTER TO NETWORK CLOSE"
    ] },
    { label: 'NET_GETAVAILABLEBYTES', parameters: ['POINTER NETH'], return_type: 'INT',parameterDetails: [
        "POINTER NETWORK CONNECTION"
    ] },
    { label: 'NET_GETRECEIVEBUFFERSIZE', parameters: ['POINTER NETH'], return_type: 'INT',parameterDetails: [
        "POINTER NETWORK CONNECTION"
    ] },
    { label: 'NET_GETREMOTEADDR', parameters: ['POINTER NETH'], return_type: 'STRING',parameterDetails: [
        "POINTER NETWORK CONNECTION"
    ] },
    { label: 'NET_IS_NEW_CONNECTION', parameters: ['POINTER NETH'], return_type: 'INT', parameterDetails: [
        "POINTER NETWORK CONNECTION"
    ] },
    { label: 'NET_IS_MESSAGE_INCOMING', parameters: ['POINTER EVENT'], return_type: 'INT',parameterDetails: [
        "POINTER TO NETWORK EVENT"
    ] },
];

function provideCompletionAndSignatureHelp(document, position, token, context) {
    // Parte de Autocompletado
    if (context && context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
        const completionItems = functions.map(func => {
            const item = new vscode.CompletionItem(func.label.toLowerCase(), vscode.CompletionItemKind.Function);
            item.insertText = `${func.label.toLowerCase()}()`;
            item.detail = `Función: ${func.label}(${func.parameters.join(', ')})`;
            item.documentation = func.return_type ? `Retorna: ${func.return_type}` : '';
            return item;
        });
        return completionItems;
    }

    // Parte de Ayuda de Firma para Funciones Sobrecargadas
    const line = document.lineAt(position.line).text;
    const functionMatch = line.match(/(\w+)\s*\(/);

    if (!functionMatch) return null;

    const functionName = functionMatch[1].toUpperCase();
    const matchingFunctions = functions.filter(f => f.label === functionName);

    if (matchingFunctions.length === 0) return null;

    // Obtener el texto dentro de los paréntesis y contar los parámetros ingresados
    const paramsText = line.slice(line.indexOf('(') + 1, position.character);
    const paramsEntered = paramsText.split(',').filter(param => param.trim() !== '').length;

    // Crear SignatureHelp y agregar todas las sobrecargas como firmas
    const signatureHelp = new vscode.SignatureHelp();
    matchingFunctions.forEach((func, index) => {
        const signature = new vscode.SignatureInformation(
            `${func.label}(${func.parameters.join(', ')})`
        );

        func.parameters.forEach((param, paramIndex) => {
            const description = func.parameterDetails ? func.parameterDetails[paramIndex] : '';
            signature.parameters.push(new vscode.ParameterInformation(param, description));
        });

        signatureHelp.signatures.push(signature);
    });

    // Selecciona la sobrecarga que tenga el mismo número de parámetros o la más cercana
    const activeSignatureIndex = matchingFunctions.findIndex(f => f.parameters.length === paramsEntered);
    signatureHelp.activeSignature = activeSignatureIndex >= 0 ? activeSignatureIndex : 0;
    signatureHelp.activeParameter = Math.max(0, paramsEntered - 1);

    return signatureHelp;
}











// Comando para compilar
async function compileCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        await vscode.commands.executeCommand('workbench.action.files.save');

        const filePath = editor.document.fileName;
        const directoryPath = path.dirname(filePath);
        const compilerPath = getExecutablePath('bgdc');

        if (!compilerPath) {
            vscode.window.showErrorMessage('Compilador (bgdc) no encontrado en el PATH.');
            return;
        }

        diagnostics.clear(); // Limpia errores antiguos antes de cada compilación

        exec(`${compilerPath} "${filePath}"`, { cwd: directoryPath }, (err, stdout, stderr) => {
            outputChannel.clear();
            outputChannel.show(true);  // Muestra el panel de salida sin cambiar el foco

            if (stdout) {
                outputChannel.append(stdout);
                parseErrors(stdout, diagnostics);
            }
            if (stderr) {
                outputChannel.append(stderr);
                parseErrors(stderr, diagnostics);
            }

            if (err) {
                vscode.window.showErrorMessage('Error durante la compilación.');
            }
        });
    } else {
        vscode.window.showErrorMessage('No hay un archivo abierto para compilar.');
    }
}

// Comando para ejecutar el archivo compilado
function runCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const filePath = editor.document.fileName.replace('.prg', '.dcb');
        const directoryPath = path.dirname(filePath);
        const interpreterPath = getExecutablePath('bgdi');

        if (!interpreterPath) {
            vscode.window.showErrorMessage('Intérprete (bgdi) no encontrado en el PATH.');
            return;
        }

        outputChannel.clear();
        outputChannel.show(true);

        exec(`cd "${directoryPath}" && ${interpreterPath} "${filePath}"`, (err, stdout, stderr) => {
            if (stdout) outputChannel.append(stdout);
            if (stderr) outputChannel.append(stderr);
            if (err) {
                vscode.window.showErrorMessage('Error al ejecutar el intérprete.');
            }
        });
    } else {
        vscode.window.showErrorMessage('No hay un archivo abierto para ejecutar.');
    }
}

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('bennugd2.compile', compileCommand),
        vscode.commands.registerCommand('bennugd2.run', runCommand),
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: 'bennugd2' },
            {
                provideCompletionItems: provideCompletionAndSignatureHelp
            },
            '.' // Activador de autocompletado
        ),
        vscode.languages.registerSignatureHelpProvider(
            { scheme: 'file', language: 'bennugd2' },
            {
                provideSignatureHelp: provideCompletionAndSignatureHelp
            },
            '(', ',' // Activadores para mostrar la firma al escribir '(' o ','
        ),
        outputChannel,
        diagnostics
    );
}

function deactivate() {}

function getExecutablePath(command) {
    try {
        return which.sync(command);
    } catch {
        return null;
    }
}

module.exports = {
    activate,
    deactivate
};

