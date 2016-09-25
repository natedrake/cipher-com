/**
 *  @author John O'Grady
 *  @date 15/11/2015
 *  @note class for easy date manipulation and displaying
 **/
var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

var months = [
    "Januray",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

var DateHelper = function(date) {
    this.dateObj = date;
    this.getdate = function() {
        this.date = this.dateObj.getDate();
        this.day = this.dateObj.getDay();
        this.fullYear = this.dateObj.getFullYear();
        this.month = this.dateObj.getMonth();
        return (this.fullYear+"/"+(parseInt(this.month+1))+'/'+this.date);
        //return (this.date+"/"+(parseInt(this.month+1))+'/'+this.fullYear);
    }

    this.gettime = function() {
        this.seconds = this.dateObj.getSeconds();
        this.minutes = this.dateObj.getMinutes();
        this.hours = this.dateObj.getUTCHours();
        return (this.hours+':'+this.minutes+':'+this.seconds);
    }

    this.datetime = function() {
        return (this.getdate()+' '+this.gettime());
    }

    this.epoch = function(){
        return this.dateObj.getTime();
    }
    this.getCurrentBigEndian = function() {
        var d = new Date();
        return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    }
}
module.exports = DateHelper;
/** **/
