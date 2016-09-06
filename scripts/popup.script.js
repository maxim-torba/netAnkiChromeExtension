$(function () {
    var btnLogin = $('.btn-login');
    var words = {};
    var word;
    
    if (localStorage.logged == undefined || localStorage.logged === 'false') {
        btnLogin.css('display', 'block');
    } else {
        btnLogin.css('display', 'none');
    }
    
    btnLogin.on('click', function () {
        chrome.tabs.create({url: $(this).attr('href')});
    });
    
    $(document.forms['translate']).on('submit', function (e) {
        var url = "http://api.lingualeo.com/gettranslates?" + $(this).serialize();
        word = $(this).find('input[name="word"]').val();
        if (word != '') {
            $.ajax({
                url: url,
                method: "GET",
                
                statusCode: {
                    200: function (data) {
                        words = data;
                        var form = document.forms['translate'];
                        if (data.error_msg == '') {
                            $(form).fadeOut(400, function () {
                                showTranslates(data);
                            });
                        } else {
                            showMessage(data.error_msg);
                        }
                    }
                },
                error: function () {
                    showMessage('Can\'t get translate to due problem with internet');
                }
            });
        } else {
            showMessage('Type the word or select on page');
        }
        return false;
    });
    
    function showTranslates(data) {
        var wordCollection = [], imgCollection = [];
        
        $.each(data.translate, function (index, translate) {
            wordCollection.push($(document.createElement('li')).addClass('word').append(
                $(document.createElement('span')).text(translate.value).on('click', function () {
                    $(this).toggleClass('checked-word');
                })
            ));
            
            if (translate.pic_url) {
                imgCollection.push($(document.createElement('li')).addClass('img').append(
                    $(document.createElement('img')).attr('src', translate.pic_url).on('click', function () {
                        $('#translates-list').find('img').each(function () {
                            $(this).removeClass('checked-img');
                        });
                        $(this).addClass('checked-img');
                    })));
            }
        });
        
        $('#translates-list').append(wordCollection, imgCollection);
        $('#translates-container').fadeIn();
        $('#btn-newSearch').fadeIn();
    }
    
    function showMessage(message) {
        Materialize.toast(message, 4000);
    }
    
    $('#btn-send').on('click', function () {
        if (localStorage.logged == undefined || localStorage.logged === 'false') {
            showMessage('Your should log in for this action');
            return;
        }
        
        var wordData = {};
        var translateStr = '';
        var translateInputVal = $('#translate-input').val();
        
        $('.checked-word').each(function () {
            translateStr += $(this).text() + '; ';
        });
        
        if (translateInputVal != '') {
            translateStr += translateInputVal + ';';
        }
        
        wordData.sword = word;
        wordData.stranscription = words.transcription;
        wordData.stranslate = translateStr || words.translate[0].value;
        wordData.sexample = $('#example-input').val();
        wordData.spic = $('.checked-img').attr('src') || words.pic_url;
        wordData.ssong = words.sound_url;
        
        $.ajax({
            url: "http://netanki-maximtorba.rhcloud.com/words",
            method: "POST",
            data: wordData,
            
            statusCode: {
                200: function (data) {
                    showMessage('was added the next word: ' + data.word.word);
                }
            },
            error: function () {
                showMessage('changes were not saved due to problems with the Internet');
            }
        });
    });
    
    $('#google-translate').on('click', function () {
        var googleTranslateURL = "https://translate.google.com/#en/ru/" + word;
        chrome.windows.create({
            url: googleTranslateURL
        });
    });
    
    $('#btn-newSearch').on('click', function () {
        location.reload();
    });
    
    chrome.commands.onCommand.addListener(commandListener);
    
    function commandListener(command) {
        if (command === 'selected-text') {
            getSelectedText();
        }
    }
    
    function getSelectedText() {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {method: "getSelection"}, function (response) {
                $('#word-input').val(response.data);
            });
        });
    }
    
    getSelectedText();
});