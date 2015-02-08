var BUG_CHAR = 'x';
var bugs = [
    [1, 2, 3],
    [1, 0, 2],
    [1, 2, 3],
];

var getPosition = function(index, length){
    var row = Math.floor(index / length);
    var column = index % length;
    return [row, column];
}

var getBugCount = function(index, maze){
    var position = getPosition(index, maze.length);
    var count = 0;
    for(var i = position[0] - 1; i <= position[0] + 1; i++){
        for(var j  = position[1] - 1; j <= position[1] + 1; j++){
            if(i < 0 || j < 0 || i >= maze.length || j >= maze.length){
                continue;
            }
            if(maze[i][j] == BUG_CHAR){
                count += 1;
            }
        }
    }
    return count;
}
var createMaze = function(totalBugs, length){
    var totalCells = length * length;
    //console.info(typeof totalBugs, typeof length, totalBugs, length);
    if(totalBugs > totalCells){
        throw 'Too Many Bugs, Not Enough Cells. Ideally, number of bugs should be half of total cells.';
    }
    var maze = new Array(length);
    for(var i = 0; i < length; i++){
        maze[i] = new Array(length);
    }
    for(var i = 0; i < totalBugs; i++){
        var randomIndex = _.random(0, totalCells - 1);
        var position = getPosition(randomIndex, length);
        if(!maze[position[0]][position[1]]){
            maze[position[0]][position[1]] = BUG_CHAR;
        }
        else{
            i -= 1;
        }
    }

    for(var i = 0; i < totalCells; i++){
        var position = getPosition(i, length);
        if(maze[position[0]][position[1]] === BUG_CHAR){
            continue;
        }
        maze[position[0]][position[1]] = getBugCount(i, maze);
    }
    return maze;
}

var CellView = React.createClass({displayName: "CellView",
    getInitialState: function() {
        return {
            flagged: false,
            viewed: false
        };
    },

    handleClick: function(event) {
        this.setState({viewed: true});
        if(this.isBug()){
            this.props.onInfection(this);
        }
    },

    isBug: function(){
        return this.props.data === BUG_CHAR;
    },

    onFlag: function(event) {
        console.info("onFlag", this.state);
        this.setState({flagged: true});
        event.preventDefault();
    },
    render: function() {
        var text = '?';
        var classString = 'ui button cell';
        if(this.state.viewed){
            if(this.props.data === BUG_CHAR ){
                text = (React.createElement("i", {className: "bug icon"}));
                classString += ' button ui negative';
            }else{
                classString = 'cell';
                text = this.props.data;
            }
        }
        else if(this.state.flagged){
            text = (React.createElement("i", {className: "flag icon"}));
        }
        return (
            React.createElement("div", {className: classString, onClick: this.handleClick, onContextMenu: this.onFlag}, 
                text
            )
        );
    }
});


var CellRowView = React.createClass({displayName: "CellRowView",
    render: function() {
        var self = this;
        var cellNodes = this.props.data.map(function (cell) {
            return (
                React.createElement(CellView, {data: cell, onInfection: self.props.onInfection})
            );
        });
        return (
            React.createElement("div", {className: "cellRow"}, 
                cellNodes
            )
        );
    }
});

var IntegerInputView = React.createClass({displayName: "IntegerInputView",
    getInitialState: function() {
        return {data: this.props.data};
    },
    handleChange: function(newValue) {
        newValue = parseInt(newValue);
        if(isNaN(newValue)){
            newValue = '';
        }
        //if(newValue !== ""){
        //    console.info("min", isNaN(newValue), newValue < this.props.min, newValue > this.props.max);
        //    if(this.props.min && newValue < this.props.min){
        //        newValue = this.props.min;
        //    }
        //    else if(this.props.max && newValue > this.props.max){
        //        newValue = this.props.max;
        //    }
        //}
        this.setState({
            data: newValue
        });
        this.props.onUpdate(this, newValue);
    },
    render: function() {
        var valueLink = {
            value: this.state.data,
            requestChange: this.handleChange
        };
        return (
            React.createElement("input", {type: "text", valueLink: valueLink, min: this.props.max, min: this.props.max})
        )
    }
});


var BugSweeperView = React.createClass({displayName: "BugSweeperView",
    getInitialState: function() {
        return {
            maze: [],
            mazeLength: 10,
            totalBugs: 25,
            version: 0
        };
    },

    componentDidMount: function(){
        this.restartMaze();
    },

    stopGame: function(){
        if(this.state.interval){
            clearInterval(this.state.interval);
        }
    },

    restartMaze: function(){
        this.stopGame();

        try{
            this.setState({
                'maze': createMaze(this.state.totalBugs, this.state.mazeLength)
            });
            this.setState({'timer': 0});
            this.setState({'version': this.state.version + 1});
            this.setState({'interval': setInterval(this.onUpdateTimer, 1000)});
        }
        catch(err){
            alert(err);
        }
    },


    onInfection: function(){
        this.restartMaze();
        alert("You have been infected with the bug!")
    },

    onUpdate: function(key, parent, newValue){
        this.state[key] = newValue;
    },

    onUpdateTimer: function(){
        this.setState({timer: this.state.timer + 1})
    },

    render: function() {
        var self = this;
        var cellRowNodes = this.state.maze.map(function (cellRow) {
            return (
                React.createElement(CellRowView, {data: cellRow, key: self.state.version + cellRow, onInfection: self.onInfection})
            );
        });
        return (
            React.createElement("div", {className: "cells"}, 
                React.createElement("h2", {className: "ui dividing header"}, "Work that muscle"), 
                React.createElement("form", {className: "ui inline form"}, 
                    React.createElement("div", {className: "fields"}, 
                        React.createElement("div", {className: "one wide field"}, 
                            React.createElement("label", null, "Timer"), 
                            React.createElement("div", {className: "ui huge green circular label"}, this.state.timer)
                        ), 
                        React.createElement("div", {className: "one wide field"}, 
                            React.createElement("label", null, "Total Bugs"), 
                            React.createElement(IntegerInputView, {data: this.state.totalBugs, min: "1", max: "100", onUpdate: _.curry(this.onUpdate)('totalBugs')})
                        ), 
                        React.createElement("div", {className: "one wide field"}, 
                            React.createElement("label", null, "Maze Size"), 
                            React.createElement(IntegerInputView, {data: this.state.mazeLength, min: "5", max: "20", onUpdate: _.curry(this.onUpdate)('mazeLength')})
                        ), 
                        React.createElement("div", {className: "two wide field"}, 
                            React.createElement("label", null, " "), 
                            React.createElement("div", {className: "primary button ui", onClick: this.restartMaze}, "New Game")
                        )
                    )
                ), 
                cellRowNodes
            )
        );
    }
});
React.render(
    React.createElement(BugSweeperView, null),
    document.getElementById('bug-sweeper')
);