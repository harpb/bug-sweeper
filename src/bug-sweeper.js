var bugs = [
    [1, 2, 3],
    [1, 0, 2],
    [1, 2, 3],
];

var Cell = React.createClass({
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
            text = (<i className="bug icon"></i>);
            classString += ' button ui negative';
        }
        return (
            <div className={classString} onClick={this.handleClick}>
            {text}
            </div>
        );
    }
});


var CellRow = React.createClass({
    render: function() {
        var cellNodes = this.props.data.map(function (cell) {
            return (
                <Cell data={cell}></Cell>
            );
        });
        return (
            <div className="cellRow">
                {cellNodes}
            </div>
        );
    }
});
var BugSweeper = React.createClass({
    render: function() {
        var cellRowNodes = this.props.data.map(function (cellRow) {
            return (
                <CellRow data={cellRow}></CellRow>
            );
        });
        return (
            <div className="cells">
                <h2 class="ui dividing header">Work that muscle</h2>
                {cellRowNodes}
            </div>
        );
    }
});
React.render(
    <BugSweeper data={bugs} />,
    document.getElementById('bug-sweeper')
);