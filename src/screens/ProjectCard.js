import React from 'react';
import { View, Text } from 'react-native';
import { thisTypeAnnotation } from '@babel/types';

export default class ProjectCard extends React.Component {
    constructor(props) {
        super();
        console.log(props.project)
        this.state = { project: props.project }
    }

    render() {
        return (
            <View style={{marginTop: 15}}>
                <Text style={{ fontWeight: 'bold' }}>{ this.state.project._id }</Text>
                <Text>{ this.state.project.description }</Text>
            </View>
        )
    }
}

