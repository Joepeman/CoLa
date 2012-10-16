$(function(){
    
        // TODO: Implement a proper garbage collector for elements that are too small to be visible
        // This is a comment from Gijs
        // This is what Joep Added!
        
	// This application depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

	// The URL of your web server (the port is set in Cola.js)
        // var url = 'http://145.99.194.190:3001';
        var url = 'http://127.0.0.1:3001';

	var doc = $(document);
        var win = $(window);
	var canvas = $('#stage');
	
        var context = canvas[0].getContext('2d');
        
        var lastEmit;
        var prev = {};
        
	var instructions = $('#instructions');
        
        // Values for drawing shapes
        var startPositionX;
        var startPositionY;
        
        // Different drawing modes, varying from "square drawing" to pencil drawing
        var selectionMode = false;
        var pencilMode = true;
        var highlightMode = false;

	// Generate an unique ID
	var id = Math.round($.now()*Math.random());

	// A flag for drawing activity
	var drawing = false;

        // Data containers
	var clients = {};
	var cursors = {};
        var selector;
        var instruction;
        var mode = "pencilMode";
        
        // Array with a collection of instructions, this way each instruction obtains a unique ID.
        // The application keeps track of al the drawn instructions.
        var instructionFields = new Array();

	var socket = io.connect(url);

	initGui();
        
        // If other clients press the mouseButton
        socket.on('onMouseDown', function (data){
            
            console.log(data.mode);
            
            if(data.mode == "selectionMode"){
                selector = $('<div class="selector' + data.id + '">').appendTo('#content');
                console.log("SELECT");
            }
            
            if(data.mode == "instructionMode"){
                instruction = $('<div class="instruction' + data.id + '">').appendTo('#permanentObjects');
                console.log("INSTRUCT");
            }
        });
        
        
        // If other clients move their mouse
        socket.on('moving', function (data) {
                
		if(! (data.id in clients)){
			// a new user has come online. create a cursor for them
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
                        
                        // Dynamically add a random color to the new 'cursor'
                        cursors[data.id].css({
                            'background-color' : '#' + Math.random().toString(16).slice(2, 8)
                        });
                        
		}

		// Move the mouse pointer
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});
                
                // Is the user drawing?
		if(data.drawing && clients[data.id]){

			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
                        
                        if(data.mode == "pencilMode"){
                            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
                        }
                        
                        
                        // First draft for the client side drawing
                        if(data.mode == "selectionMode"){
                            // Draw selectors from other clients, passing the id to use it for the unique z-index
                            drawSelection(clients[data.id].startPosX, clients[data.id].startPosY, (data.x - clients[data.id].startPosX), (data.y - clients[data.id].startPosY), data.id);
                        }
                        
                        if(data.mode == "instructionMode"){
                            // Draw instruction from other clients, passing the id to use it for the unique z-index
                            drawInstruction(clients[data.id].startPosX, clients[data.id].startPosY, (data.x - clients[data.id].startPosX), (data.y - clients[data.id].startPosY), data.id);
                        }
                        
		}

		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});
        
        
        socket.on('removingSelector', function (data) {
            $('.selector' + data.selectorID + '').remove();
            
        });
        

	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;

		// Hide the instructions
		instructions.fadeOut();
                
                socket.emit('mouseDown', {'id' : id, 'mode' : mode});
                
                // set the first click position
                if(mode == "selectionMode"){
                    selector = $('<div class="selector' + id + '">').appendTo('#content');
                    startPositionX = prev.x;
                    startPositionY = prev.y;
                    
                }
                
                if(mode == "instructionMode"){
                    instruction = $('<div class="instruction' + id + instructionFields.length + '">').appendTo('#permanentObjects');
                    startPositionX = prev.x;
                    startPositionY = prev.y;
                }
	});

	doc.bind('mouseup mouseleave',function(e){
            drawing = false;

            if(mode == "selectionMode"){
                // Remove the created selectionfield
                $('.selector'+id+'').remove();

                // Dispatch removal of selectionfield to other clients
                socket.emit('removeSelector',{
                    'selectorID' : id
                });

            }
	});
        
        // A separate mouseup bind for drawing instructions
        doc.bind('mouseup', function(e){
            if(mode == "instructionMode"){
                // Simply put, if the drawn box is too small, ignore it!
                if($('.instruction' + id + instructionFields.length).width() > 50 && $('.instruction' + id + instructionFields.length).height() > 50){
                    //TODO: Create a neat comment system

                    $('<input type="text" name="Description" value="Enter text..." autofocus="autofocus">').appendTo('.instruction' + id + instructionFields.length);
                    console.log(instructionFields.length);
                }
            }
            
            //TODO: What happens after a textfield has been added?...
            
            // Add the new drawn instruction to the array
            instructionFields.push(instruction);
        });
        
        lastEmit = $.now();

	doc.on('mousemove',function(e){
		if($.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'startPosX' : startPositionX,
                                'startPosY' : startPositionY,
                                'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id,
                                'mode' : mode
			});
			lastEmit = $.now();
		}

		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above

		if(drawing){
                        
                        if(mode == "pencilMode"){
                            drawLine(prev.x, prev.y, e.pageX, e.pageY);

                            prev.x = e.pageX;
                            prev.y = e.pageY;
                        }
                        
                        if(mode == "selectionMode"){
                            drawSelection(startPositionX, startPositionY, (e.pageX - startPositionX), (e.pageY - startPositionY));
                        }
                        
                        if(mode == "instructionMode"){
                            drawInstruction(startPositionX, startPositionY, (e.pageX - startPositionX), (e.pageY - startPositionY));
                        }
                        
		}
	});

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){

				// Last update was more than 10 seconds ago.
				// This user has probably closed the page

				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
	},10000);

        //TODO: finish GUI
	function initGui(){
            var pencilModeButton = $('<div class="button centerTextContent"><i class="icon-pencil icon-large"></i></div>').appendTo('#GUI');
            
            pencilModeButton.bind('click', function(event){
                mode = "pencilMode";
                
                console.log(mode + " activated!");
                
                
            });
            
            var selectionModeButton = $('<div class="button centerTextContent"><i class="icon-screenshot icon-large"></i></div>').appendTo('#GUI');
            selectionModeButton.bind('click', function(event){
                mode = "selectionMode";
                
                console.log(mode + " activated!");
                
            });
            
            var instructionModeButton = $('<div class="button centerTextContent"><i class="icon-edit icon-large"></i></div>').appendTo('#GUI');
            instructionModeButton.bind('click', function(event){
                mode = "instructionMode";
                
                console.log(mode + " activated!");
            });
        }
        
        function drawLine(fromx, fromy, tox, toy){
            context.moveTo(fromx, fromy);
            context.lineTo(tox, toy);
            context.stroke();
	}
        
        function drawSelection(fromx, fromy, tox, toy, id){
            selector.css(
                {
                    'position' : 'absolute',
                    'top' : fromy,
                    'left' : fromx,
                    'width' : tox,
                    'height' : toy,
                    'border' : '2px dotted black',
                    'z-index' : id
                }
            );
        }
        
        function drawInstruction(fromx, fromy, tox, toy, id){
            instruction.css(
                {
                    'position' : 'absolute',
                    'top' : fromy,
                    'left' : fromx,
                    'width' : tox,
                    'height' : toy,
                    'border' : '4px solid chartreuse',
                    'z-index' : id
                }
            );
        }

});
