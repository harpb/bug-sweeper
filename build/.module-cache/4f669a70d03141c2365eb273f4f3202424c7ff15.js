var data = [
    {author: "Pete Hunt", text: "This is one comment~"},
    {author: "Jordan Walke", text: "This is *another* comment!"}
];

var Comment = React.createClass({displayName: "Comment",
    render: function() {
        return (
            React.createElement("div", {className: "comment"}, 
                React.createElement("h2", {className: "commentAuthor"}, 
                    this.props.author
                ), 
                this.props.children
            )
        );
    }
});

var CommentList = React.createClass({displayName: "CommentList",
    render: function() {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                React.createElement(Comment, {author: comment.author}, 
                    comment.text
                )
            );
        });
        return (
            React.createElement("div", {className: "commentList"}, 
                commentNodes
            )
        );
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
    render: function() {
        return (
            React.createElement("div", {className: "commentForm"}, 
            "Hello, world! I am a CommentForm."
            )
        );
    }
});
var BugSweeper = React.createClass({displayName: "BugSweeper",
    render: function() {
        return (
            React.createElement("div", {class: "cells"}
            )
        );
    }
});
React.render(
    React.createElement(CommentBox, {data: data}),
    document.getElementById('comments')
);