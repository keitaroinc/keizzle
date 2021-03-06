/*
Copyright (c) 2018 Keitaro AB

Use of this source code is governed by an MIT license
that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
*/

var PUZZLE_DIFFICULTY = 2;
const PUZZLE_HOVER_TINT = '#009900';

var _stage;
var _canvas;

var _img;
var _pieces;
var _puzzleWidth;
var _puzzleHeight;
var _pieceWidth;
var _pieceHeight;
var _currentPiece;
var _currentDropPiece;

var _mouse;
var canvasWidth;
var canvasHeight;
var scaleRate;
var img_loaded = false;
var intFrameWidth;
var intFrameHeight;
var scaleMin;
var levelImgs = ['img/keitaro-logo.png', 'img/mavrovo_keitaro.jpg', 'img/keitaro_torta.jpg'];
var imgWin = 'img/keitarian_win.jpg';
var levelId = 0;

function nextLevel() {
    console.log('hereeeeee');
    console.log(levelId);
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
    PUZZLE_DIFFICULTY++;
    img_loaded = false;
    init(levelId);
}

function init(levelId) {
    canvasWidth = document.getElementById('canvas').offsetWidth;
    canvasHeight = document.getElementById('canvas').offsetHeight;
    intFrameWidth = window.innerWidth;
    intFrameHeight = window.innerHeight;

    _img = new Image();
    _img.addEventListener('load', onImage, false);
    if (typeof levelId != 'undefined') {
        _img.src = levelImgs[levelId];
    } else {
        _img.src = levelImgs[0];
    }
}

function getImageSize() {

    // horizontal image
    scaleWidth = intFrameWidth / _img.width;
    scaleHeight = intFrameHeight / _img.height;

    scaleRate = scaleWidth;
    scaleMin = scaleWidth;

    if (scaleHeight > 1 && scaleWidth > 1) {
        if (scaleHeight > scaleWidth) {
            scaleRate = scaleHeight;
            scaleMin = scaleWidth;
        } else {
            scaleRate = scaleWidth;
            scaleMin = scaleHeight;
        }
    } else {
        if (scaleHeight < scaleWidth) {
            scaleRate = scaleHeight;
            scaleMin = scaleWidth;
        } else {
            scaleRate = scaleWidth;
            scaleMin = scaleHeight;
        }

    }

    if (scaleRate > 1) {
        if (intFrameWidth > _img.width && intFrameHeight > _img.height) {
            canvasWidth = _img.width * scaleMin;
            canvasHeight = _img.height * scaleMin;
        } else {
            canvasWidth = _img.width / scaleMin;
            canvasHeight = _img.height / scaleMin;
        }
    } else {
        canvasWidth = _img.width * scaleRate;
        canvasHeight = _img.height * scaleRate;
    }
}

function onImage(e) {
    if (!img_loaded) {

        img_loaded = true;
        getImageSize();

        _pieceWidth = Math.ceil(canvasWidth / PUZZLE_DIFFICULTY);
        _pieceHeight = Math.ceil(canvasHeight / PUZZLE_DIFFICULTY);
        _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
        _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;

        intFrameWidth = window.innerWidth;
        intFrameHeight = window.innerHeight;

        setCanvas();
        initPuzzle();
    }

}

function setCanvas() {
    _canvas = document.getElementById('canvas');
    _stage = _canvas.getContext('2d');
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
}

function initPuzzle() {
    _pieces = [];
    _mouse = {
        x: 0,
        y: 0
    };
    _currentPiece = null;
    _currentDropPiece = null;
    // _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight);
    _img.src = _canvas.toDataURL();

    createTitle("Click to Start Puzzle");
    buildPieces();
}

function createTitle(msg) {
    _stage.fillStyle = "#000000";
    _stage.globalAlpha = .4;
    _stage.fillRect(100, _puzzleHeight - 40, _puzzleWidth - 200, 40);
    _stage.fillStyle = "#FFFFFF";
    _stage.globalAlpha = 1;
    _stage.textAlign = "center";
    _stage.textBaseline = "middle";
    _stage.font = "1.5vw Arial";
    _stage.fillText(msg, _puzzleWidth / 2, _puzzleHeight - 20);
}

function buildPieces() {
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for (i = 0; i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY; i++) {
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    document.onmousedown = shufflePuzzle;
}

function shufflePuzzle() {
    _pieces = shuffleArray(_pieces);
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
        xPos += _pieceWidth;
        if (xPos >= _puzzleWidth) {
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
    document.onmousedown = onPuzzleClick;
}

function onPuzzleClick(e) {
    if (e.layerX || e.layerX == 0) {
        _mouse.x = e.layerX - _canvas.offsetLeft;
        _mouse.y = e.layerY - _canvas.offsetTop;
    } else if (e.offsetX || e.offsetX == 0) {
        _mouse.x = e.offsetX - _canvas.offsetLeft;
        _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    _currentPiece = checkPieceClicked();
    if (_currentPiece != null) {
        _stage.clearRect(_currentPiece.xPos, _currentPiece.yPos, _pieceWidth, _pieceHeight);
        _stage.save();
        _stage.globalAlpha = .9;
        _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
        _stage.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }
}

function checkPieceClicked() {
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
            //PIECE NOT HIT
        } else {
            return piece;
        }
    }
    return null;
}

function updatePuzzle(e) {
    _currentDropPiece = null;
    if (e.layerX || e.layerX == 0) {
        _mouse.x = e.layerX - _canvas.offsetLeft;
        _mouse.y = e.layerY - _canvas.offsetTop;
    } else if (e.offsetX || e.offsetX == 0) {
        _mouse.x = e.offsetX - _canvas.offsetLeft;
        _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        if (piece == _currentPiece) {
            continue;
        }
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if (_currentDropPiece == null) {
            if (_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)) {
                //NOT OVER
            } else {
                _currentDropPiece = piece;
                _stage.save();
                _stage.globalAlpha = .4;
                _stage.fillStyle = PUZZLE_HOVER_TINT;
                _stage.fillRect(_currentDropPiece.xPos, _currentDropPiece.yPos, _pieceWidth, _pieceHeight);
                _stage.restore();
            }
        }
    }
    _stage.save();
    _stage.globalAlpha = .6;
    _stage.drawImage(_img, _currentPiece.sx, _currentPiece.sy, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
    _stage.restore();
    _stage.strokeRect(_mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
}

function pieceDropped(e) {
    document.onmousemove = null;
    document.onmouseup = null;
    if (_currentDropPiece != null) {
        var tmp = {
            xPos: _currentPiece.xPos,
            yPos: _currentPiece.yPos
        };
        _currentPiece.xPos = _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}

function resetPuzzleAndCheckWin() {
    _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for (i = 0; i < _pieces.length; i++) {
        piece = _pieces[i];
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        if (piece.xPos != piece.sx || piece.yPos != piece.sy) {
            gameWin = false;
        }
    }
    if (gameWin) {
        levelId++;
        console.log('winnnn');
        if (levelId >= levelImgs.length) {
            console.log('here');
            _img = new Image();
            _img.src = imgWin;
            _img.addEventListener('load', finishWin, false);
            //"You are Keitarian"
        } else {
            setTimeout(nextLevel, 500);
        }
    }
}

function finishWin() {
    getImageSize();
    _pieceWidth = Math.ceil(canvasWidth / PUZZLE_DIFFICULTY);
    _pieceHeight = Math.ceil(canvasHeight / PUZZLE_DIFFICULTY);
    _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
    _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;

    setCanvas();
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight);
}


function shuffleArray(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

