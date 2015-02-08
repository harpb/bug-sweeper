var BUG_CHAR = 'x';

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
            if(maze[i][j] && maze[i][j].value == BUG_CHAR){
                count += 1;
            }
        }
    }
    return count;
}
var createMaze = function(totalBugs, length){
    var totalCells = length * length;
    //console.info(typeof totalBugs, typeof length, totalBugs, length);
    if(totalBugs > totalCells - 1){
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
            maze[position[0]][position[1]] = {
                column: position[1],
                index: randomIndex,
                row: position[0],
                value: BUG_CHAR
            };
        }
        else{
            i -= 1;
        }
    }

    for(var i = 0; i < totalCells; i++){
        var position = getPosition(i, length);
        if(maze[position[0]][position[1]]){
            continue;
        }
        maze[position[0]][position[1]] = {
            column: position[1],
            index: i,
            row: position[0],
            value: getBugCount(i, maze)
        }
    }
    return maze;
}

var moveBugAround = function(maze, index){
    var totalCells = maze.length * maze.length;
    for(var i = (index + 1) % totalCells; i != index; i = (i + 1) % totalCells)
    {
        var position = getPosition(i, maze.length);
        if(maze[position[0]][position[1]].value !== BUG_CHAR){
            maze[position[0]][position[1]].value = BUG_CHAR;
            break;
        }
    }
    var position = getPosition(index, maze.length);
    maze[position[0]][position[1]].value = '';
    for(var i = 0; i < totalCells; i++){
        var position = getPosition(i, maze.length);
        if(maze[position[0]][position[1]].value === BUG_CHAR){
            continue;
        }
        maze[position[0]][position[1]] = {
            column: position[1],
            index: i,
            row: position[0],
            value: getBugCount(i, maze)
        }
    }
}

var getAvailableMoves = function(maze){
    var totalCells = maze.length * maze.length;
    var moves = []
    for(var i = 0; i < totalCells; i++){
        var position = getPosition(i, maze.length);
        if(maze[position[0]][position[1]].value > 0){
            moves.push(position);
        }
    }
    console.info('getAvailableMoves', moves.length);
    return moves;
}
var CellView = React.createClass({
    getInitialState: function() {
        return {
            flagged: false,
            viewed: false
        };
    },

    componentDidMount: function(){
        //if(!this.isBug()){
        //    this.setState({'viewed': true});
        //}
        this.props.data.view = this
    },

    componentDidUpdate: function(prevProps, prevState){
        this.props.onCellUpdated(this,  this.props.data);
    },

    handleClick: function(event) {
        this.onView();
    },

    isBug: function(){
        return this.props.data.value === BUG_CHAR;
    },

    isViewed: function(event) {
        return this.state.viewed;
    },

    isZero: function(){
        return this.props.data.value === 0;
    },

    onFlag: function(event) {
        //console.info("onFlag", this.state);
        this.setState({flagged: true});
        event.preventDefault();
    },

    onView: function(silenceZeroReveal) {
        if(silenceZeroReveal === undefined){
            silenceZeroReveal = false;
        }

        if(this.state.viewed){
            return;
        }

        this.props.onViewCell(this,  this.props.data);

        this.setState({viewed: true});
        if(!silenceZeroReveal && this.isZero()){
            this.props.onZeroReveal(this,  this.props.data);
        }
    },

    render: function() {
        var text = '?';
        var classString = 'ui button cell';
        if(this.state.viewed){
            if(this.isBug()){
                text = (<i className="bug icon"></i>);
                classString += ' button ui negative';
            }else{
                classString = 'cell';
                text = !this.isZero() ? this.props.data.value : '';
            }
        }
        else if(this.state.flagged){
            text = (<i className="flag icon"></i>);
        }
        return (
            <div className={classString} onClick={this.handleClick} onContextMenu={this.onFlag}>
                {text}
            </div>
        );
    }
});


var CellRowView = React.createClass({
    render: function() {
        var self = this;
        var cellNodes = this.props.data.map(function (cell) {
            return (
                <CellView data={cell}
                    onCellUpdated={self.props.onCellUpdated}
                    onViewCell={self.props.onViewCell}
                    onZeroReveal={self.props.onZeroReveal}/>
            );
        });
        return (
            <div className="cellRow">
                {cellNodes}
            </div>
        );
    }
});

var IntegerInputView = React.createClass({
    getInitialState: function() {
        return {data: this.props.data};
    },
    handleChange: function(newValue) {
        newValue = parseInt(newValue);
        if(isNaN(newValue)){
            newValue = '';
        }
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
            <input type="text" valueLink={valueLink} min={this.props.max} min={this.props.max}/>
        )
    }
});


var BugSweeperView = React.createClass({

    getInitialState: function() {
        return {
            maze: [],
            mazeLength: 5,
            totalBugs: 24,
            totalViews: 0,
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
            this.setState({
                interval: setInterval(this.onUpdateTimer, 1000),
                timer: 0,
                totalViews: 0,
                version: this.state.version + 1
            });
        }
        catch(err){
            alert(err);
        }
    },

    onCompleted: function(){
        this.restartMaze();
        alert("Congratulations! You won the game.")
    },

    onInfection: function(){
        this.restartMaze();
        alert("You have been infected with the bug!")
    },

    onCellUpdated: function(view, data){
        if(view.isViewed() && view.isBug()){
            this.onInfection();
        }
    },

    onUpdate: function(key, parent, newValue){
        this.state[key] = newValue;
    },

    onUpdateTimer: function(){
        this.setState({timer: this.state.timer + 1})
    },

    onViewCell: function(view, data){
        if(this.state.totalViews === 0 && view.isBug()){
            moveBugAround(this.state.maze, data.index);
        }
        if(!view.isZero() && !view.isBug()){
            this.setState({totalViews: this.state.totalViews + 1});
            if(getAvailableMoves(this.state.maze).length == this.state.totalViews + 1){
                this.onCompleted();
            }
        }
    },

    onZeroReveal: function(view, cell){
        //console.info('onZeroReveal', view, data);
        var maze = this.state.maze;
        var cells = [cell];
        for (var counter = 0; counter < cells.length; counter++) {
            var data = cells[counter];
            for(var i = data.row - 1; i <= data.row + 1; i++){
                for(var j  = data.column - 1; j <= data.column + 1; j++){
                    if(i < 0 || j < 0 || i >= maze.length || j >= maze.length
                        || (i != data.row && j != data.column) || (i == data.row && j == data.column)){
                        continue;
                    }
                    if(maze[i][j].view.isZero() && !maze[i][j].view.isViewed()){
                        maze[i][j].view.onView(true);
                        if(cells.indexOf(maze[i][j]) === -1){
                            cells.push(maze[i][j]);
                        }
                    }
                }
            }
        }
    },

    render: function() {
        var self = this;
        var cellRowNodes = this.state.maze.map(function (cellRow) {
            return (
                <CellRowView data={cellRow}
                    key={self.state.version + cellRow[0].index}
                    onCellUpdated={self.onCellUpdated}
                    onViewCell={self.onViewCell}
                    onZeroReveal={self.onZeroReveal}/>
            );
        });
        return (
            <div className="cells">
                <h2 className="ui dividing header">Work that muscle V.{self.state.version}</h2>
                <form className="ui inline form">
                    <div className="fields">
                        <div className="one wide field">
                            <label>Timer</label>
                            <div className="ui huge green circular label">{this.state.timer}</div>
                        </div>
                        <div className="one wide field">
                            <label>Total Bugs</label>
                            <IntegerInputView data={this.state.totalBugs} min="1" max="100" onUpdate={_.curry(this.onUpdate)('totalBugs')}/>
                        </div>
                        <div className="one wide field">
                            <label>Maze Size</label>
                            <IntegerInputView data={this.state.mazeLength} min="5" max="20" onUpdate={_.curry(this.onUpdate)('mazeLength')}/>
                        </div>
                        <div className="two wide field">
                            <label>&nbsp;</label>
                            <div className="primary button ui" onClick={this.restartMaze}>New Game</div>
                        </div>
                    </div>
                </form>
                {cellRowNodes}
            </div>
        );
    }
});

React.render(
    <BugSweeperView/>,
    document.getElementById('bug-sweeper')
);