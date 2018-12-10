//VARIABLES GLOBALES----------------------------------------------------------------------
var grid = document.getElementById('instruct');
var Instrucciones;
crearGrid();
var Inst;
var PC=0;//contador de programa
var IR=0;//registro de instrucciones
var AC=0;//acumulador
var Lectura;//valores ingresados por el usuario
var cod_estado=0;//Sin errores. 1 es para error	
var msj_estado="";//Mensaje del estado	
var linea=0;//Línea en la que sucede un error
var cont_i=1;
var instActual;//Obtiene una instrucción
var OpCode;//código de operación de la instrucción
var signo;//signo de la instrucción
var ubicacion;//ubicación de memoria a operar
var sobrante;//Verifica si hay más contenido del que debería.
var stepEjec=1;
Time=2000;
//EVENTOS-----------------------------------------------------------------------------------------
$("#clear").click(function(){
    Instrucciones.destroy();
    crearGrid();
    limpiarVariables();
});

$("#ejecutar").click(function(){
    Ejecutar();
});

$(document).ready(function() {
	$('input#input_text, textarea#textarea2').characterCounter();
	if($(document).width()>=992){
		ajustarAltura();
	}			
});

$(document).keydown(function () {
	if(event.keyCode==115){
		Ejecutar();
	}
});

$(window).resize(function(){ 
	ajustarAltura();
});

var colorRendererRjo = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.backgroundColor = "#F7C2BE";
};
var colorRendererBlanco = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.backgroundColor = "white";
    td.id = 'noCurrent';
};
var colorRendererMorado = function (instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.backgroundColor = "#a5d6a7";
    td.id = 'currentLine';
};
//FUNCIONES------------------------------------------------------------------------------------
function ajustarAltura(){
	if($(document).width()>=992){
		alturaWin = $(window).height();
		alturaNav = $("#navBar").height();
		alturaContenedores = alturaWin - alturaNav - 60;
		alturaInstruc = alturaContenedores-200		
	}else{
		alturaContenedores = "auto";
		alturaInstruc = "auto";
	}
	$("#contenedor1").height(alturaContenedores);
	//$("#contenedor2").height(alturaInstruc);
	//$("#contenedor3").height(alturaContenedores);
	$("#contenedorMemoria").height(2*alturaContenedores/5);
	$("#contenedorEjecucion").height(3*alturaContenedores/5);
}

function crearGrid(){
	Instrucciones = new Handsontable(grid, {
	  startRows: 8,
	  startCols: 1,
	  stretchH: 'all',
	  minSpareRows: 1,
	  rowHeaders: true,
	  contextMenu: true,
	  height: 350
	});
	$("#hot-display-license-info").css("display","none");
}
function ObtenerInstrucciones(){
	return Instrucciones.getData(); //Obtenemos las instrucciones	
}

function limpiarBR(){
	for(i=0;i<=Inst.length;i++){
		if(Inst[i]!=undefined){
			Inst[i] = Inst[i].toString().replace(/\r?\n|\r/, '');
		}		
	}
}
function limpiarVariables(){
	$("#depurContenedor").html("");
	$("#tbl_memoria").html("");
	PC=0;//contador de programa
	IR=rellenar(0,5);//registro de instrucciones
	AC=0;//acumulador
	Lectura=0;//valores ingresados por el usuario
	cod_estado=0;//Sin errores. 1 es para error	
	msj_estado="";//Mensaje del estado	
	linea=0;
	Time=2000;
	Instrucciones.updateSettings({
	  cells: function (row, col, prop) {
	        if (row === (linea-1) && cod_estado==0) {
	            this.renderer = colorRendererBlanco;
	        }
	    }
	});	
	cont_i=1;
	$("#reg_pc").html(rellenar(PC,3));
	$("#reg_ir").html(IR);
	$("#reg_ac").html(AC);
	$("#imp_pant").html("");
}
function rellenar( number, width ){
	signo="+";
	if(number<0){
		signo="-";
		number=number*(-1);
	}	
	  width -= number.toString().length;
	  if ( width > 0 )
	  {
	    return signo + new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	  }
	    
	  return signo + number + "";//cadena
}
function imprimirEstadoInstruccion(){
	var icono_estado;
	var color_icono;
	if(cod_estado==1){
		icono_estado="close";
		color_icono="red";
		$("#imp_pant").html('<i class="large material-icons red-text">error_outline</i>');
	}else{
		icono_estado="check";
		color_icono="green";
	}  
	$("#depurContenedor").append('<li class="collection-item avatar"><i class="material-icons circle '+color_icono+'">'+icono_estado+'</i><span class="title">Instrucción '+ (cont_i) +': <span>'+msj_estado+'</span></span><p>PC: <span>'+rellenar(PC,3)+'</span></p><p>IR: <span>'+IR+'</span></p><p>AC: <span>'+AC+'</span></p></li> ');	
	$("#reg_pc").html(rellenar(PC,3));
	$("#reg_ir").html(IR);
	$("#reg_ac").html(AC);
	$("#contenedorEjecucion").animate({ scrollTop: $("#depurContenedor").height() }, Time);
}

function imprimirEstadoMemoria(){
	$("#tbl_memoria").html("");
	for(i=0;i<Inst.length;i++){
    	if(Inst[i]!="" && Inst[i] !== undefined ){
    		$("#tbl_memoria").append('<tr><td>'+rellenar(i,3)+'</td><td>'+Inst[i]+'</td></tr>');
    	}
    }
}
function subrayado(){
	Instrucciones.updateSettings({
	  cells: function (row, col, prop) {
	        if (row == PC && cod_estado!==1) {
	            this.renderer = colorRendererMorado;
	        }else if (row == (PC) && cod_estado==1) {
	            this.renderer = colorRendererRjo;
	        }else{
	        	this.renderer = colorRendererBlanco;
	        }
	    }
	});
}
function Ejecutar(){		
	Instrucciones.selectCell();
	ajustarAltura();	
	limpiarVariables();
	Inst = ObtenerInstrucciones();
	limpiarBR();	
	if($('#chk_stepe').prop('checked')==false){
		Time=0;
	}
	var steps = setInterval(function() {			    
	    subrayado();
		try {
		    var elmnt = document.getElementById("currentLine");
    		elmnt.scrollIntoView();	
		}catch(err) {}	    
    	stepByStep();	
		if (cod_estado==1 || cod_estado==2) {
			subrayado();
			imprimirEstadoMemoria();
	    	clearInterval(steps);
	    }
	}, Time);	  
}

function stepByStep(){	
		
	if(Inst[PC]!="" && Inst[PC] !== undefined ){  		 	
		instActual = String(Inst[PC]); //Obtiene una instrucción
		OpCode = parseInt(instActual.substring(1,3));//código de operación de la instrucción	
		signo = instActual.substring(0,1);//signo de la instrucción
		ubicacion = signo+instActual.substring(3,6);//ubicación de memoria a operar
		sobrante = instActual.substring(6);//Verifica si hay más contenido del que debería.
		if(sobrante!=""||(signo!="+"&&signo!="-")||parseInt(ubicacion)>999||parseInt(ubicacion)<0){
			linea = PC+1;
        	cod_estado=1;
        	msj_estado="Error de sintaxis";
        	imprimirEstadoInstruccion();
        	return; 

		}
		switch(OpCode) {//clasifica la operación dependiendo del código de operacion
		    case 10://Lee
		        Lectura = parseInt(prompt("Ingrese el valor que desea leer:"));
		        if(Lectura<-999 || Lectura>999 || isNaN(Lectura)){
		        	linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Error de lectura, el valor ingresado no es valido.";
		        	imprimirEstadoInstruccion(); 
		        	break;
		        }
		        Inst[parseInt(ubicacion)]=rellenar(Lectura, 5)
		        cod_estado=0;
		        msj_estado="Lee "+Lectura;			        
		        imprimirEstadoInstruccion();			        
		        IR=Inst[PC];
		        PC++;
		        break;
		    case 11://Escribe
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="No se pudo imprimir el valor en la ubicación: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					$("#imp_pant").html(valor);
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="No se pudo imprimir el valor en la ubicación: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
				}
		    	cod_estado=0;
		        msj_estado="Escribe "+valor; 
		        imprimirEstadoInstruccion();
				IR=Inst[PC];
		    	PC++
		        break;
		    case 20://Carga
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Valor inexistente en la ubicación de memoria: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					AC = parseInt(valor);
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="No se pudo cargar el valor en el acumulador";
		        	imprimirEstadoInstruccion();
					break;
				}
				cod_estado=0;
		        msj_estado="Carga "+valor; 
		        imprimirEstadoInstruccion();
				IR=Inst[PC];
				PC++
		        break;
		    case 21://Almacena
		    	Inst[parseInt(ubicacion)] = rellenar(AC, 5);
		    	cod_estado=0;
		        msj_estado="Almacena "+AC; 
		        imprimirEstadoInstruccion();
		    	IR=Inst[PC];
		    	PC++
		        break;
		    case 30://Suma
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Valor inexistente en la ubicación de memoria: " + ubicacion;
		        	imprimirEstadoInstruccion(); 
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					AC=AC+valor;
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Sintaxis no válida.";
		        	imprimirEstadoInstruccion();
					break;
				}						
				cod_estado=0;
		        msj_estado="Suma "+valor; 
		        imprimirEstadoInstruccion();
				IR=Inst[PC];		    	
		    	PC++
		        break;
		    case 31://Resta
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Valor inexistente en la ubicación de memoria: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					AC = AC - (valor);
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Sintaxis no válida.";
		        	imprimirEstadoInstruccion();
					break;
				}
				cod_estado=0;
		        msj_estado="Resta "+valor; 
		        imprimirEstadoInstruccion();
				IR=Inst[PC];			
		    	PC++
		        break;
		    case 32://Divide
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Valor inexistente en la ubicación de memoria: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					AC=parseInt(valor/AC);
					if(isNaN(AC)){
						linea = PC+1;
			        	cod_estado=1;
			        	msj_estado="Error de división entre 0";
			        	imprimirEstadoInstruccion();
			        	break;
					}
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Sintaxis no válida.";
		        	imprimirEstadoInstruccion();
					break;
				}
				cod_estado=0;
		        msj_estado="Divide "+valor; 
		        imprimirEstadoInstruccion();
				IR=Inst[PC];			
		    	PC++
		        break;
		    case 33://Multiplica
		    	posicion = Inst[parseInt(ubicacion)];
		    	if(posicion===undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Valor inexistente en la ubicación de memoria: " + ubicacion;
		        	imprimirEstadoInstruccion();
					break;
		    	}
		    	OpCode = parseInt(posicion.substring(1,3));
				valor = parseInt(posicion.substring(0,1)+posicion.substring(3,6));
				sobrante = posicion.substring(6);
				if(OpCode==00 && sobrante==""){
					AC=parseInt(AC*valor);
				}else{
					linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="Sintaxis no válida.";
		        	imprimirEstadoInstruccion();
					break;
				}	
				cod_estado=0;
		        msj_estado="Multiplica "+valor;
		        imprimirEstadoInstruccion(); 
				IR=Inst[PC];		
		    	PC++
		        break;
		    case 40://Bifurca
		    	if(Inst[parseInt(ubicacion)]==""||Inst[parseInt(ubicacion)]==undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="La dirección de memoria no posee contenido.";
		        	imprimirEstadoInstruccion();
			    	break;
		    	}
		    	cod_estado=0;
		        msj_estado="Bifurca a "+ubicacion; 
		        imprimirEstadoInstruccion();
		    	IR=Inst[PC];			    	
		    	PC = parseInt(ubicacion);
		        break;
		    case 41://BifurcaNeg
		    	if(Inst[parseInt(ubicacion)]==""||Inst[parseInt(ubicacion)]==undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="La dirección de memoria no posee contenido.";
		        	imprimirEstadoInstruccion();
			    	break;
		    	}
		    	if(AC<0){
		    		cod_estado=0;
		        	msj_estado="Bifurca a "+ubicacion; 
		        	imprimirEstadoInstruccion();
		    		IR=Inst[PC];
		    		PC = parseInt(ubicacion);
		    	}else{
		    		cod_estado=0;
		        	msj_estado="No bifurca, el acumulador es positivo."; 
		        	imprimirEstadoInstruccion();
		    		IR=Inst[PC];
		    		PC++;
		    	}
		        break;
		    case 42://BifurcaCero
		    	if(Inst[parseInt(ubicacion)]==""||Inst[parseInt(ubicacion)]==undefined){
		    		linea = PC+1;
		        	cod_estado=1;
		        	msj_estado="La dirección de memoria no posee contenido.";
		        	imprimirEstadoInstruccion();
			    	break;
		    	}
		    	if(AC==0){
		    		cod_estado=0;
		        	msj_estado="Bifurca a "+ubicacion; 
		        	imprimirEstadoInstruccion();
		    		IR=Inst[PC];
		    		PC = parseInt(ubicacion);
		    	}else{
		    		cod_estado=0;
		        	msj_estado="No bifurca, el acumulador es distinto a cero."; 
		        	imprimirEstadoInstruccion();
		    		IR=Inst[PC];
		    		PC++;
		    	}
		        break;
		    case 43://Alto
		    	cod_estado=2;//salir
		    	msj_estado="Alto";
		    	imprimirEstadoInstruccion();
		        break;
		    default:
		    //alert(OpCode);
		    	linea = PC+1;
	        	cod_estado=1;
	        	msj_estado="Instrucción no válida";
	        	imprimirEstadoInstruccion();
		    	break;
		}
		cont_i++;//Aumentando el número de instrucción;		
		if(AC>999 || AC<-999){
			linea = PC+1;
        	cod_estado=1;
        	msj_estado="El acumulador excedió los límites de su valor";
        	imprimirEstadoInstruccion();
		
		}
	}else{		
		if(cod_estado!=2){
			if(PC==0){
				cod_estado=1;
			}
			else{
				linea = PC+1;
	        	cod_estado=1;
	        	msj_estado="Debe indicar el final del programa.";
	        	imprimirEstadoInstruccion();
			}
		}
	}      
} 