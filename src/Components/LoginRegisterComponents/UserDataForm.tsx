import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Animated, StyleSheet, Easing, TextInput } from "react-native";

const width = (Dimensions.get("screen").width * 2) / 3 + 50;

interface IUserForm {
    label: string;
    duration?: number;
    labelColor?: string;
    text?: string;
    updateText?: (text: string) => void;
}

const styles = StyleSheet.create({
    input: {
        width: width,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5
    }
});

const UserDataForm: React.FC<IUserForm> = ({ label, duration = 300, labelColor = '#000', text = '', updateText }) => {
    return (
        <TextInput
            value={text}
            onChangeText={updateText}
            style={styles.input}
        />
    );
};

export { UserDataForm };