import shimmer from "shimmer";
import { AttributeNames } from "./enum/AttributeNames";
import { getTracing } from "./commonTracing";
import api from "@opentelemetry/api";
import React from 'react';

/**Steps to follow
 * start the span 
 * set te parent space by setting the actice context 
 * */
const self = this;
export const UserContext = React.createContext();

 //  Make a copy of the original add function 
const originalUseEffect = React.useEffect;
export const _instrumentFunction = (react, span, original) => {

    let wasError = false;
    try {
        return api.context.with(api.trace.setSpan(api.context.active(), span), () => {
            return original();
        });
    }
    catch (err) {
        span.setAttribute(AttributeNames.REACT_ERROR, err.stack);
        wasError = true;
        throw err;
    }
    finally {
        span.end();

    }
}

/**
     * Patches the render lifecycle method
     */
export const _patchUseEffect = () => {
    // return (original) => {
    const plugin = this;
    // return function patchUseEffect(...args) {

    //setting the span 
    // const tracer = getTracing("example-react-load", AttributeNames.EFFECT_SPAN);
    // tracer.end();
    // const apply = plugin._instrumentFunction(this, 'componentDidMount', tracer, () => {
    //     return original.apply(this, args);
    // });

    // return original.apply(this, args);        
    //  };
    // };
}



/**
     * Patches the setState function
     */
export const _patchSetState = () => {
    return (original) => {
        const plugin = this;
        return function patchSetState(...args) {
            const tracer = getTracing("example-react-load", AttributeNames.EFFECT_SPAN);
            tracer.end();

            //     const parentSpan = plugin._getParentSpan(this, AttributeNames_1.AttributeNames.UPDATING_SPAN);
            return plugin._instrumentFunction(this, 'setState()', tracer, () => {
                return original.apply(this, args);
            });
        };
    };
}

/**
    * patch function which wraps all the lifecycle methods
    */
export const patch = () => {
    console.log("Patch function called")
    console.log("context", UserContext)

    // // Make a copy of the original add function 
    // const origUseEffect = React.useEffect;
    // React.useEffect = function() {
    //     //console.log(`Adding the result of ${a} and ${b}`);
    //     return origUseEffect();
    // }
    shimmer.wrap(React.useEffect, 'useEffect', _patchUseEffect());
    //  shimmer.wrap(this, 'setState',_patchSetState());
}



export const useEffectMonkeyPatching = () => {
 //  Make a copy of the original add function 
 const originalUseEffect = React.useEffect;
    console.log("tracerUseEffect function called");
   // const origUseEffect = React.useEffect;
    React.useEffect = function (...args) {
       console.log("Use effect called by monkey patching");
      //  return originalUseEffect();
           return originalUseEffect.apply(React,args);
    }

}


/**
    * unpatch function to unwrap all the lifecycle methods
    */
export const unpatch = () => {
    console.log("Unpatch method called")
    shimmer.unwrap(this, 'useEffect');
    //   shimmer.unwrap(this, 'setState');

    // this._parentSpanMap = new WeakMap();
}