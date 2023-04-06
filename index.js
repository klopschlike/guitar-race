function ConsoleDisplay() {
    var rowFunction = function(number) {
        return numberToSparseRow(3, number);
    }
    return {
        update: function(gameState) {
            console.table(gameState.map(rowFunction));
        }
    };
}
function DomDisplay(x, y) {
    let game;
    var rowFunction = function(number) {
        return numberToSparseRow(3, number);
    }
    function drawGameState(gameState) {
        const asdf = gameState.queue.map(rowFunction);
        for(let row = 0; row < y; row++) {
            for(let field = 0; field < x; field++) {
                setColorForFieldInRow(row, field, asdf[row][field] ? '#cc0000': '#00cc00')
            }
        }
    }
    function setColorForFieldInRow(row, field, color)
    {
        document.getElementById("field-"+row+"-"+field).style['background-color'] = color;
    }
    function drawLoop() {
        //console.log('draw')
        drawGameState(game.getGameState())
        requestAnimationFrame(drawLoop)
    }
    return {
        update: function(gameState) {
        },
        startAnimation: function() {
            drawLoop()
        },
        setGameInstance: function(gameInstance) {
            game = gameInstance;
        }
    };
}

function blaGenerator(lanes) {
    function getRandomInt(max) {
        return Math.floor(Math.pow(2, lanes) * Math.random());
    }
    return () => getRandomInt(Math.pow(2, lanes));
}

function numberToSparseRow(rowsize, number) {
    var result = []
    for (let i = 0; i < rowsize; i++) {
        result.push(number % 2);
        number = (number >> 1);
    }
    return result;
}

var gameState = {
};

function Game(lanes, size, players) {
    let displays = [];
    let generator = blaGenerator(lanes);
    let queue = [];
    for (let i = 0; i < size; i++) {
        queue.push(0);
    }

    // let playersLives = [5, 5];
    let inputs = [
        KeyboardInput(['a', 's', 'd']),
        KeyboardInput(['l', 'ö', 'ä'])
    ]
    let userPoints = [0, 0];
    function getUsersInput() {
        return inputs.map((input) => input.getInput())
        // return [generator(), generator()];
    }

    let usersInput = [];

    function step() {
        // queue
        queue.push(generator());
        // Aktuellen Input lesen
        let currentRow = queue.shift();
        // Schritt gehen

        // Bewertung der Benutzer
        usersInput = getUsersInput();
        let additionalPoints = usersInput.map((input) => input & currentRow);
        let newPoints = userPoints;
        for(let i = 0; i < newPoints.length; i++) {
            newPoints[i] += additionalPoints[i]
        }
        userPoints = newPoints;
        // Fehlen nurnoch die Strafpunkte
        console.log(userPoints);

        // Prüfen
        displays.forEach(d => d.update(queue));
    }

    function registerDisplay(display) {
        displays.push(display);
        if (typeof display.setGameInstance === 'function') {
            display.setGameInstance(this);
        }
    }

    return {
        step: step,
        registerDisplay: registerDisplay,
        getGameState: function() {
            return {
                queue: queue,
                input: usersInput
            }
        }
    };
}

function KeyboardInput(chars) {
    let input = [0, 0, 0];
    window.addEventListener('keyup', function(event) {
        if (chars.indexOf(event.key) !== -1) {
            input[chars.indexOf(event.key)] = 0;
        }
    });
    window.addEventListener('keydown', function(event) {
        if (event.repeat === false && chars.indexOf(event.key) !== -1) {
            input[chars.indexOf(event.key)] = 1;
        }
    });
    function getInputAsNumber() {
        return input.reduce((accumulator, currentValue, index) => accumulator + currentValue * Math.pow(2, index) );
    }
    return {
        getInput: getInputAsNumber,
    };
}
// var input = KeyboardInput(['a', 's', 'd']);

let game = Game(3, 4, 2);
// game.registerDisplay(ConsoleDisplay())
var domDisplay = DomDisplay(3, 4);
game.registerDisplay(domDisplay)
domDisplay.startAnimation()
game.step();
game.step();
game.step();
setInterval(game.step, 2000);

