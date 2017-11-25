// /**
//  * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
//  * For licensing, see LICENSE.md or http://ckeditor.com/license
//  */

// CKEDITOR.editorConfig = function( config ) {
// 	// Define changes to default configuration here. For example:
// 	// config.language = 'fr';
// 	// config.uiColor = '#AADC6E';
// };

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.toolbar =[
        ['Bold','Italic','Underline','Strike'],
        ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
        ['NumberedList','BulletedList','Blockquote'],
        ['Image','Smiley'],
        ['FontSize','TextColor','BGColor','Maximize']
    ]
    config.enterMode = CKEDITOR.ENTER_BR;
};

 CKEDITOR.on('dialogDefinition', function (e) {
    var dialogName = e.data.name;
    var dialog = e.data.definition.dialog;
    var dialogDefinition = e.data.definition;

    //mod image2 dialog, hide URL source, set default align and width
    if (dialogName == "image2") {
        dialog.on('show', function() {
            this.getContentElement('info', 'src').disable(); //<-- works
            this.selectPage('Upload');
            // this.selectPage('Upload').hideButton('Ok');
            var infoTab = dialogDefinition.getContents('info');
            var imageWidth = infoTab.get('width');
            imageWidth['default'] = '151px';
            console.log('size -> ' + this.getSize().width)
            console.log("default -> " + imageWidth['default'])
            console.log('imageWidth -> ' + imageWidth.width);
        });             


        // var imageAlign = infoTab.get('align');
        // imageAlign['default'] = 'center';

        // var imageWidth = infoTab.get('width');
        // imageWidth['default'] = '151';

        // var imageCaption = infoTab.get('hasCaption');
        // imageCaption['default'] = 'checked';
        // dialogDefinition.onLoad = function() {
            
        //     this.selectPage('Upload');

            
        //     // var dialog = CKEDITOR.dialog.getCurrent();
            
        //     // dialog.on( 'selectPage', function( e ) {
                
        //     //     // alert(ev.data.page);
        //     //     if(e.data.page =='info') {
        //     //         // timerVal = setInterval(timeoutHander,100);                              
        //     //     }
        //     // });
        // }
    }
});

// CKEDITOR.on( 'dialogDefinition', function( ev ) {
//   var tab, field, dialogName = ev.data.name,
//       dialogDefinition = ev.data.definition;
//   var timerVal = null;
//   var defaultImageSize = 150;
//   var infoTab;

//   function timeoutHander() {
//         //¼±ÅÃÇÑ ÅÇÀÌ infoÀÌ¸é 
//         var dialog = CKEDITOR.dialog.getCurrent();
//         var img = new Image();
//         //var img1 = new Image();
//         var url = dialog.getValueOf('info','Url');           
//         img.src = url; // ÀÌ¹ÌÁö ÁöÁ¤
//         //alert(img.src);
//         if(img.width > 0 && img.height > 0) {
//             var width = dialog.getValueOf('info','txtWidth');
//             var height = dialog.getValueOf('info','txtHeight');
//             clearInterval(timerVal);
                        
//             if(defaultImageSize > img.width)
//                 dialog.setValueOf('info','txtWidth',img.width);
//             if(defaultImageSize <= img.width) {
//               var ratio = defaultImageSize/img.width;           
//               dialog.setValueOf('info','txtWidth',parseInt(img.width*ratio));
//               dialog.setValueOf('info','txtHeight',parseInt(img.height*ratio));
//             }
            
//             img = null;
//         } else            
//         img = null;
//     }
  
//   if( dialogName == 'image' ) {
//     infoTab = dialogDefinition.getContents( 'info' );
//     txtWidth = infoTab.get( 'width' );
//     txtWidth['default'] = defaultImageSize;
//     //link tab remove
//     dialogDefinition.removeContents('link');
//     //advanced tab remove
//     dialogDefinition.removeContents('advanced');
 
//     dialogDefinition.onLoad = function() {
            
//         this.selectPage('Upload');
        
//         var dialog = CKEDITOR.dialog.getCurrent();      
        
//         dialog.on( 'selectPage', function( ev ) {
            
//             // alert(ev.data.page);
//             if(ev.data.page =='info') {               
//                 timerVal = setInterval(timeoutHander,100);                              
//             }           
//         }); 
//     }
//   }  //if( dialogName == 'image' )
// });