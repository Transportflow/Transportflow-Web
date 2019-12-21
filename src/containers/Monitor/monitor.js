import React from "react";
import {geolocated} from "react-geolocated";
import "../../css/tailwind.css"
import Suggestions from "../../components/Suggestions";
import * as dvb from "dvbjs";
import {BarLoader} from "react-spinners";
import DarkmodeToggle from "../../components/DarkmodeToggle";
import ImpressPrivacy from "../../components/ImpressPrivacy";
import BackButton from "../../components/BackButton";
import NetworkSwitch from "../../components/NetworkSwitch";

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            input: "",
            loading: true
        };
    }

    componentDidMount = async () => {
        this.setState({loading: false});
    };

    redirect = async event => {
        this.setState({loading: true});
        var stop = await dvb.findStop(event.target.id);
        if (stop.length < 1) {
            return;
        }
        this.props.history.push("/monitor/"+(localStorage.getItem("network")||"db")+"/stop/" + stop[0].id);
    };

    handleChange = event => {
        this.setState({
            input: event.target.value
        });
    };

    render() {
        return (
            <div className="p-6 pt-12 sm:p-20 lg:pl-56 bg-gray-400 dark\:bg-gray-800 min-h-screen trans">
                <div className="flex mb-3">
                    <BackButton to="/" large={true}/>
                    <DarkmodeToggle large={true}/>
                </div>
                <h1 className="font-semibold font-inter text-2xl text-black dark\:text-gray-200">
                    Transportflow Monitor
                </h1>
                {!this.state.loading ? (
                    <p className="font-inter text-gray-700 dark\:text-gray-400 mb-4">Echtzeit Fahrplanauskunft</p>
                ) : (
                    <div className="rounded-lg overflow-hidden max-w-xs pb-6 pt-2 dark\:text-gray-400">
                        <BarLoader
                            heightUnit={"px"}
                            height={4}
                            widthUnit={"px"}
                            width={330}
                            color={"#718096"}
                            loading={this.state.loading}
                        />
                    </div>
                )}
                <div className="w-full sm:w-auto sm:max-w-xs">
                    <div className={localStorage.getItem("showNetworkSwitch") === "true" ? "flex w-full justify-center" : "hidden"}><NetworkSwitch/></div>
                    <div className="flex mb-3 mt-3">
                        <input
                            placeholder="haltestelle"
                            onChange={this.handleChange}
                            className="dark\:bg-gray-700 dark\:placeholder-gray-300 dark\:text-gray-300 dark-hover\:bg-gray-600 dark\:placeholder-gray-500 py-3 w-full text-lg font-inter font-semibold trans-fast rounded-lg px-3 bg-gray-300 sm:hover:bg-gray-300 focus:bg-gray-300 z-50 relative text-gray-800 sm:hover:shadow-md focus:shadow-md focus:outline-none"
                        />
                    </div>
                    <div className="w-full font-semibold font-inter dark\:text-gray-400">
                        <Suggestions
                            input={this.state.input}
                            suggestionClick={this.redirect}
                            stopsOnly={true}
                            maxResults={30}
                        />
                    </div>
                    <ImpressPrivacy/>
                </div>

            </div>
        );
    }
}

export default geolocated({
    userDecisionTimeout: 5000
})(Index);
