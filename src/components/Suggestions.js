import React, {Component} from "react";
import Suggestion from "./Suggestion";
import * as dvb from "dvbjs";
import {geolocated} from "react-geolocated";
import {bvgProfile} from './profiles/bvg';
const createClient = require('hafas-client');

class Suggestions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestions: []
        };
    }

    componentDidMount() {
        this.getLocation();
    }

    componentDidUpdate(nextProps) {
        if (this.props.input === nextProps.input && this.props.network === nextProps.network) {
            return;
        }
        if (this.props.input.length > 0) {
            this.findSuggestions(this.props.input);
        } else {
            this.getLocation();
        }
    }

    getLocation = async () => {
        if (!this.props.coords) {
            setTimeout(this.getLocation, 100);
            return;
        }
        if (this.props.isGeolocationAvailable && this.props.isGeolocationEnabled) {
            var longitude = this.props.coords.longitude;
            var latitude = this.props.coords.latitude;

            this.props.setState({loading: true});
            if (localStorage.getItem("network") === "bvg") {
                const client = createClient(bvgProfile, "suggestionClient");
                const stops = await client.nearby({
                    type: 'location',
                    longitude: longitude,
                    latitude: latitude
                });

                if (this.props.input.length === 0)
                    this.setState({suggestions: stops});
            } else {
                const stops = await dvb.findAddress(
                    longitude,
                    latitude
                );

                var locationSuggestions = [];
                stops.stops.forEach(stop => {
                    locationSuggestions.push(stop);
                });

                if (this.props.input.length === 0)
                    this.setState({suggestions: locationSuggestions});
            }
            this.props.setState({loading: false});
        }
    };

    findSuggestions = async input => {
        this.props.setState({loading: true});
        if (localStorage.getItem("network") === "dvb") {
            var stops;
            if (this.props.stopsOnly) {
                stops = await dvb.findStop(input).catch((err) => {
                    this.setState({suggestions: []});
                    this.props.setState({loading: false});
                });
            } else {
                stops = await dvb.findPOI(input).catch((err) => {
                    this.setState({suggestions: []});
                    this.props.setState({loading: false});
                });
            }

            if (stops === undefined) {
                return;
            }

            var suggestions = [];

            // eslint-disable-next-line array-callback-return
            stops.map((value, index) => {
                if (index < this.props.maxResults) {
                    suggestions.push(value);
                }
            });

            this.setState({suggestions: suggestions});
        } else if (localStorage.getItem("network") === "bvg") {
            const client = createClient(bvgProfile, "suggestionClient");
            const stops = await client.locations(input, this.props.stopsOnly ? {addresses: false, poi: false} : {addresses: true, poi: true});

            if (stops.length === 1 && stops[0].id === null) {
                this.setState({suggestions: []});
                this.props.setState({loading: false});
                return;
            }

            this.setState({suggestions: stops});
        }
        this.props.setState({loading: false});

    };

    suggestionClick = async event => {
        event.preventDefault();
        if (this.props.clearSuggestions) {
            this.setState({suggestions: []});
        }
        this.props.suggestionClick(event);
    };

    render() {
        return (
            <>
                {this.state.suggestions.map((value, index) => (
                    <Suggestion
                        key={index}
                        value={value}
                        index={index}
                        suggestions={this.state.suggestions}
                        suggestionClick={this.suggestionClick}
                    />
                ))}
            </>
        );
    }
}

export default geolocated({
    userDecisionTimeout: 5000
})(Suggestions);
