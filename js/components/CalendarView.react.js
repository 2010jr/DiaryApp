var React = require('react');
var ReactDOM = require('react-dom');
var ReactPropTypes = React.PropTypes;
var d3Util = require('../util');
var d3 = require('d3');
var Calendar = require('./Calendar.react.js');

var CalendarView = React.createClass({
		propTypes: { 
				url: React.PropTypes.string.isRequired,
		},

		getDefaultProps: function() {
				return {
				}
		},

		getInitialState: function() {
				return {
						tdate: new Date(),
						goals: ["Goal1", "Goal2", "Goal3"],
						activeGoalInd : 0,
						progressRates: [0,0,0],
				};
		},

		handleChangeDate : function(event) {
				var changedDate = d3Util.month_format.parse(event.target.value);
				console.log("changedDate : " + changedDate);
				this.setState({
						tdate: changedDate, 
				});
				var result = ReactDOM.unmountComponentAtNode(document.getElementById("calendar-component"));
				var transferProps = {
						tdate : changedDate,
					    dataSet : this.state.dataSet,
						activeIndex : this.state.activeGoalInd,
				};
			    ReactDOM.render(<Calendar {...transferProps} />, document.getElementById("calendar-component"));
		},

		handleChangeGoal : function(ind) {
			this.setState({
					activeGoalInd : ind 
			});	 
			var result = ReactDOM.unmountComponentAtNode(document.getElementById("calendar-component"));
			var transferProps = {
						tdate : this.state.tdate,
					    dataSet : this.state.dataSet,
						activeIndex : ind, 
			};
		    ReactDOM.render(<Calendar {...transferProps} />, document.getElementById("calendar-component"));
		},

		render: function() {
				return <div>
						<div className="form-tabs">
						 <div className="form-group">
						  <input className="form-control" type="month" value={d3Util.month_format(this.state.tdate)} onChange={this.handleChangeDate}></input>
						  <div className="list-group">
						   {this.state.goals.map(function(val, ind) {
						   	 return <a ref="#" className={ind === this.state.activeGoalInd ? "list-group-item active" : "list-group-item"} onClick={this.handleChangeGoal.bind(this, ind)}><span className="badge">{this.state.progressRates[ind]}</span>{val}</a>;
						    }.bind(this))
						   }
						  </div>
						 </div>
					    </div>
						<div id="calendar-component"></div>
						</div>;
		},

		getGoalAndUpdate: function(goalType, tdate) {
				d3.json("goal" + "/" + goalType + "/" + d3Util.formatDate(tdate, goalType),function(error, json) {
						if (null != error) {
								console.log(error);
								return;
						}
						if (json.length > 0) {
								this.setState({
										goals: [json[0].goal1, json[0].goal2, json[0].goal3],
								});
						}
				}.bind(this));
		},

		getDiaryAndUpdate : function(tDate) {
				var sDate = d3Util.date_format(d3Util.nextMonthFirstDate(tDate));
				var eDate = d3Util.date_format(d3Util.thisMonthFirstDate(tDate));
				var reqUrl = this.props.url + "?" + "date[$gte]=" + sDate + "&date[$lt]=" + eDate; 

				d3.json(reqUrl, function(error, json) { 
					if ( null != error) {
							console.log(error);
							return;
					}	
					this.setState({
							dataSet : json,
					});
					var result = ReactDOM.unmountComponentAtNode(document.getElementById("calendar-component"));
					var transferProps = {
							tdate : this.state.tdate,
							dataSet : json,
							activeIndex : this.state.activeIndex, 
					};
		    		ReactDOM.render(<Calendar {...transferProps} />, document.getElementById("calendar-component"));
				}.bind(this));
		},
		
		componentDidMount: function() {
				var sDate = d3Util.date_format(d3Util.nextMonthFirstDate(this.state.tdate));
				var eDate = d3Util.date_format(d3Util.thisMonthFirstDate(this.state.tdate));
				this.getGoalAndUpdate("month", this.state.tdate);
				this.getDiaryAndUpdate(this.state.tdate);
			    ReactDOM.render(<Calendar tdate={this.state.tdate} dataSet={this.state.dataSet} activeIndex={this.state.activeGoalInd} />, document.getElementById("calendar-component"));
		},
});

module.exports = CalendarView;
