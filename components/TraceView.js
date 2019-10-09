import React from 'react';
import firebase from 'react-native-firebase';
import { Button } from 'react-native';

export default class TraceView extends React.Component {

    constructor() {
        super();
        this.endpoint = 'http://echo.jsontest.com/insert-key-here/insert-value-here/key/value';
        this.trace = null;
    }

    async componentDidMount() {
        // Define & start trace
        this.trace = firebase.perf().newTrace('cache_trace');
        await this.trace.start();

        // Set initial attributes
        // await this.trace.putAttribute('user_id', firebase.auth().currentUser.uid);
        await this.trace.putAttribute('endpoint', this.endpoint);
        await this.trace.putMetric('requests', 0);
    }

    async componentWillUnmount() {
        await this.trace.stop();
    }

    _onPress = async () => {
        const response = await fetch(this.endpoint);
        const json = await response.json();

        // Increment the requests metric by 1
        await this.trace.incrementMetric('requests', 1);

        // Increment a metric based on whether the payload was cached
        if (json.cached) await this.trace.incrementMetric('requests_cached', 1);
        else await this.trace.incrementMetric('requests_not_cached', 1);
    }

    render() {
        return (
            <Button
                title="Press to get data"
                onPress={this._onPress}
            />
        );
    }

}