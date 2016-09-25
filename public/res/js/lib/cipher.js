/**
 *  @author John O'Grady
 *  @date 10/11/2015
 *  @note custom class for "encrypting" text using different ciphers
 **/

/**
 * @type {string[]}
 */
var alphabet = [
    "a", "b", "c", "d", "e", "f", "g",
    "h", "i", "j", "k", "l", "m", "n", 
    "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"
];

/**
 *  @type {string[]}
 **/
var alphabetCapital = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'
];

/**
 * @type {Array}
 */
var alphabetArray = [];
alphabetArray["a"] = 0;
alphabetArray["b"] = 1;
alphabetArray["c"] = 2;
alphabetArray["d"] = 3;
alphabetArray["e"] = 4;
alphabetArray["f"] = 5;
alphabetArray["g"] = 6;
alphabetArray["h"] = 7;
alphabetArray["i"] = 8;
alphabetArray["j"] = 9;
alphabetArray["k"] = 10;
alphabetArray["l"] = 11;
alphabetArray["m"] = 12;
alphabetArray["n"] = 13;
alphabetArray["o"] = 14;
alphabetArray["p"] = 15;
alphabetArray["q"] = 16;
alphabetArray["r"] = 17;
alphabetArray["s"] = 18;
alphabetArray["t"] = 19;
alphabetArray["u"] = 20;
alphabetArray["v"] = 21;
alphabetArray["w"] = 22;
alphabetArray["x"] = 23;
alphabetArray["y"] = 24;
alphabetArray["z"] = 25;

/**
 * @param string
 * @returns {string}
 */
function caesar() {
    var enc = '';
    /**
     *  @note check if an offset has been applied
     **/
    if (typeof(this.offset) === undefined) {
        this.offset = 3;
    }
    /**
     *  @note iterate through each char in our string
     **/
    for(var i = 0; i < this.string.length; i++ ) {
        /**
         *  @note Caesar cipher will allow spaces and symbols, other cipher will remove all 
         **/
        if (this.string.charAt(i).match(/\s|\d|[^a-zA-Z]/)) {
            /**
             *  @note append allowed characters 
             **/
            enc += this.string.charAt(i);
            /**
             *  @note finish current iteration of the loop 
             **/
            continue;
        }
        /**
         *  @note get the integer value for the position of the current letter 
         **/
        var iLetter = parseInt(alphabetArray[this.string.charAt(i).toLowerCase()]);
        /**
         *  @note append the encrypted letter to the encrypted phrase 
         **/
        enc += alphabetCapital[((iLetter+this.offset)%alphabet.length)];
    }
    return enc;
}

/**
 *  @param string
 *  @returns {string}
 *  @note formula for vigenere cipher
 *      E=(M[i] + K[i]) % 26
 *      D=(M[i] - K[i]) % 26
 *      where: M[i] = i-th character of input text,
 *      K[i] = i-th character of key
 */
function vigenere(key) {
    var enc = '';
    /**
     *  @note replace all non digits or letter for better security 
     **/
    this.string = this.string.replace(/\s|\d|[^a-zA-Z]/g, '');
    for(var i = 0; i < this.string.length; i++) {
        /** 
         *  @note integer of each letters position in alphabet, e.g. a=0, b=1, .., z=25 
         **/
        var iLetter = parseInt(alphabetArray[this.string.charAt(i).toLowerCase()]);
        /**
         *  @note corresponding key letter 
         **/
        var sKey = key.charAt(i % key.length).toLowerCase();
        /**
         *  @note get the integer value of key letter 
         **/
        var iKey = parseInt(alphabetArray[sKey]);
        /** 
         *  @note append the encrypted letter to the encrypted phrase
         **/
        enc += (alphabetCapital[((iLetter + iKey)%alphabet.length)]);
    }
    /**
     *  @note return the encrypted phrase
     **/
    return enc;
}

/**
 * @param int
 */
function setOffset(offset) {
    this.offset = offset;
}

/**
 * @param string
 * @constructor
 */
var Cipher = function(string) {
    this.string = string;
    this.caesar = caesar;
    this.setOffset = setOffset;
    this.vigenere = vigenere;
};
module.exports = Cipher;