/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.toolbar =[
        ['Bold','Italic','Underline','Strike'],
        ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
        ['NumberedList','BulletedList','Outdent','Indent','Blockquote','RemoveFormat'],
        ['Image','Table','Smiley','SpecialChar'],
        ['Format','Font','FontSize','TextColor','BGColor','Maximize']
    ]
    config.enterMode = CKEDITOR.ENTER_BR;
};

CKEDITOR.on( 'dialogDefinition', function( ev ) {
  var tab, field, dialogName = ev.data.name,
      dialogDefinition = ev.data.definition;
  var timerVal = null;
  var defaultImageSize = 150;

  var infoTab; 
  


  function timeoutHander()
    {
        //¼±ÅÃÇÑ ÅÇÀÌ infoÀÌ¸é 
        var dialog = CKEDITOR.dialog.getCurrent();
        var img = new Image();
        //var img1 = new Image();
        var url = dialog.getValueOf('info','txtUrl');           
        img.src = url; // ÀÌ¹ÌÁö ÁöÁ¤
        //alert(img.src);
        if(img.width > 0 && img.height > 0)
        {
            var width = dialog.getValueOf('info','txtWidth');
            var height = dialog.getValueOf('info','txtHeight');
            clearInterval(timerVal);
                        
            if(defaultImageSize > img.width)
                dialog.setValueOf('info','txtWidth',img.width);
            if(defaultImageSize <= img.width)
            {
              var ratio = defaultImageSize/img.width;           
              dialog.setValueOf('info','txtWidth',parseInt(img.width*ratio));
              dialog.setValueOf('info','txtHeight',parseInt(img.height*ratio));
            }
            
            img = null;
        }
        else            
        img = null;
    
    }

// if ( ev.data.name == 'image2' ) {
// ev.data.definition.getContents( 'info' ).remove( 'alignment' );
// }
  
  if( dialogName == 'image' )
  { 

    
    infoTab = dialogDefinition.getContents( 'info' );
    txtWidth = infoTab.get( 'txtWidth' );
    txtWidth['default'] = defaultImageSize;
    //link tab remove
    dialogDefinition.removeContents('link');
    //advanced tab remove
    dialogDefinition.removeContents('advanced');
 
    
    dialogDefinition.onLoad = function()
    {
            
         this.selectPage('Upload');
        
        var dialog = CKEDITOR.dialog.getCurrent();      
        
        dialog.on( 'selectPage', function( ev ) {
            
            //alert(ev.data.page);
            if(ev.data.page =='info')
            {               
                timerVal = setInterval(timeoutHander,100);                              
            }           
        }); 
    }
  }  //if( dialogName == 'image' )
    
    
  
});