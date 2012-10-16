<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />

        <title>Cola multi-user drawing</title>

        <!-- The stylesheets -->

        <link rel="stylesheet" href="assets/css/colaDefaultStyle.css" />
        <link rel="stylesheet" href="assets/css/fontAwesome.css" />

        <!--[if lt IE 9]>
          <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        
    </head>

    <body>

        <div id="cursors">
            <!-- The mouse pointers will be created here -->
        </div>
        
        <div id="GUI">
            
        </div>
        
        <div id="content">
            <!-- All the active content will be generated here -->
        </div>
        
        <div id="permanentObjects">
            <!-- Objects drawn by different users are added here -->
        </div>

        <canvas id="stage" width="1900" height="1000">
            Your browser needs to support canvas for this to work!
        </canvas>

        <hgroup id="instructions">
            
        </hgroup>

        <!-- JavaScript includes. Notice that socket.io.js is served by node.js -->

        <!-- <script src="http://145.99.194.190:3001/socket.io/socket.io.js"></script>-->
        <script src="http://127.0.0.1:3001/socket.io/socket.io.js"></script>
<!--        <script src="http://192.168.0.101:3001/socket.io/socket.io.js"></script>-->
        <script src="lib/JQuery.js"></script>
        <script src="js/Main.js"></script>
        
        <script>
            // Load previously created data
            $("#permanentObjects").load("publicDataContainer.html");
        </script>
        
    </body>

</html>