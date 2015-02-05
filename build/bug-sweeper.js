var bugs = [
    [1, 2, 3],
    [1, 0, 2],
    [1, 2, 3],
];

var Cell = React.createClass({displayName: "Cell",
    getInitialState: function() {
        return {viewed: false};
    },
    handleClick: function(event) {
        this.setState({viewed: true});
    },
    render: function() {
        var text = this.state.viewed ? this.props.data : '?';
        var classString = 'cell';
        if(!this.state.viewed){
            classString += ' button ui';
        }
        if(text == 0 ){
            text = (React.createElement("i", {className: "bug icon"}));
            classString += ' button ui negative';
        }
        return (
            React.createElement("div", {className: classString, onClick: this.handleClick}, 
            text
            )
        );
    }
});


var CellRow = React.createClass({displayName: "CellRow",
    render: function() {
        var cellNodes = this.props.data.map(function (cell) {
            return (
                React.createElement(Cell, {data: cell})
            );
        });
        return (
            React.createElement("div", {className: "cellRow"}, 
                cellNodes
            )
        );
    }
});
var BugSweeper = React.createClass({displayName: "BugSweeper",
    render: function() {
        var cellRowNodes = this.props.data.map(function (cellRow) {
            return (
                React.createElement(CellRow, {data: cellRow})
            );
        });
        return (
            React.createElement("div", {className: "cells"}, 
                React.createElement("h2", {class: "ui dividing header"}, "Work that muscle"), 
                cellRowNodes
            )
        );
    }
});
React.render(
    React.createElement(BugSweeper, {data: bugs}),
    document.getElementById('bug-sweeper')
);