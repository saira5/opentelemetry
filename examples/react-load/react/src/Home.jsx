import React from 'react';
import { Link } from 'react-router-dom';
import { BaseOpenTelemetryComponent } from '@opentelemetry/plugin-react-load';

const Home =()=>{ 
  let obj=new BaseOpenTelemetryComponent(Home);
    return (
      <div>
        <h1>
          React Plugin Demo App
        </h1>
        <Link to='/test'><button>Enter</button></Link>
      </div>
    )
}

export default Home;
