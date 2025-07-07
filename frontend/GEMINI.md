## Codebase Overview: Breeze Trading App (Frontend)

This document provides a detailed overview of the React frontend application for the Breeze Trading App, covering its architecture, state management (Redux), and styling.

### 1. Redux Implementation

- **Redux Toolkit:** The application leverages Redux Toolkit for efficient and streamlined state management.
- **RTK Query:** API interactions are handled using RTK Query, integrated through `baseApi.tsx`. This includes dynamic base URL selection (localhost vs. production) and automatic attachment of authorization headers.
- **Authentication State:** The `authSlice.ts` manages user authentication, including actions for setting and clearing credentials (`setCredentials`, `logOut`). Initial authentication state is derived from `LocalStorageService`.
- **Redux Hooks:** Custom typed hooks (`useAppDispatch`, `useAppSelector`) are defined in `src/app/hooks.ts` to ensure type safety when interacting with the Redux store.
- **Token Management:** Authentication tokens are managed using `js-cookie` (via `src/app/api/auth.ts`), storing and retrieving tokens from browser cookies.

### 2. Styling

- **Tailwind CSS:** The primary styling framework is Tailwind CSS, providing a utility-first approach to styling.
- **Configuration:** `tailwind.config.js` is configured with custom colors (defined using CSS variables for theming), extended border-radius values, custom keyframes, and animations. It also includes `tailwindcss-animate` for pre-built animations.
- **PostCSS:** `postcss.config.js` confirms the use of `tailwindcss` and `autoprefixer`, which are standard PostCSS plugins for Tailwind setups.
- **Global Styles & Theming:** `src/index.css` defines global styles, including CSS variables for a comprehensive color palette (supporting light and dark modes), custom scrollbar styling, and utility classes for visual effects like glassmorphism. The `ThemeProvider` component (likely from Shadcn UI) is used to manage theme switching.
- **Shadcn UI:** The presence of numerous component files in `src/components/ui/` (e.g., `accordion.tsx`, `button.tsx`, `dialog.tsx`) strongly indicates the use of Shadcn UI, a collection of re-usable components built with Radix UI and Tailwind CSS.
- **App.css:** `src/App.css` is empty, indicating that all global and component-specific styling is handled through Tailwind CSS and `src/index.css`.

### 3. Application Architecture

- **Entry Point:** The application's entry point is `src/main.tsx`, which renders the main `App` component, wrapped in the Redux `Provider` and `React.StrictMode`.
- **Main Application Component (`App.tsx`):**
  - Handles client-side routing using `react-router-dom`.
  - Implements `PrivateRoute` components to protect routes based on user authentication status (checking the Redux store).
  - Manages a loading screen and performs periodic health checks to the backend API.
  - Integrates global UI components such as `AnnouncementBanner`, `Toast`, and `Toaster`.
  - Utilizes `ThemeProvider` for consistent theming across the application.
- **Page Components (`src/pages/`):** Contains individual page components (e.g., `HomePage.tsx`, `InstrumentsPage.tsx`, `LoginRegPage.tsx`), ensuring a clear separation of concerns for different application views.
- **Reusable Components (`src/components/`):** Houses a variety of reusable UI components, including application-specific components (e.g., `ChartControls.tsx`, `Login.tsx`) and the Shadcn UI components within `src/components/ui/`.
- **Utility Functions (`src/lib/`):** Contains `common-functions.ts`, `common-types.ts`, and `utils.ts`, which are likely used for shared utility functions, helper methods, and common type definitions across the application.
- **Custom Hooks (`src/hooks/`):** Includes custom React hooks (e.g., `use-mobile.tsx`, `use-toast.ts`, `useResizeObserver.ts`) to encapsulate and reuse specific logic and functionalities.


### guide for using lightweight charts:
Infinite history
This sample showcases the capability of Lightweight Charts™ to manage and display an ever-expanding dataset, resembling a live feed that loads older data when the user scrolls back in time. The example depicts a chart that initially loads a limited amount of data, but later fetches additional data as required.

Key to this functionality is the subscribeVisibleLogicalRangeChange method. This function is triggered when the visible data range changes, in this case, when the user scrolls beyond the initially loaded data.

By checking if the amount of unseen data on the left of the screen falls below a certain threshold (in this example, 10 units), it's determined whether additional data needs to be loaded. New data is appended through a simulated delay using setTimeout.

This kind of infinite history functionality is typical of financial charts which frequently handle large and continuously expanding datasets.

Chart visualization is not available for this version
Switch to a version 5 or higher to see the chart

How to use the code sample
Show all code

const container = document.getElementById('container');
const chart = createChart(container, chartOptions);

const series = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
});

const datafeed = new Datafeed();

series.setData(datafeed.getBars(200));

chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
    if (logicalRange.from < 10) {
        // load more data
        const numberBarsToLoad = 50 - logicalRange.from;
        const data = datafeed.getBars(numberBarsToLoad);
        setTimeout(() => {
            series.setData(data);
        }, 250); // add a loading delay
    }
});


React - Simple example
info
The following only describes a relatively simple example that only renders an area series that could be tweaked to render any other type of series.

For a more complete scenario where you could wrap Lightweight Charts™ into a component having sub components, please consult this example.

On this page you will learn how to easily use Lightweight Charts™ with React.

Preparing your project
For the example purpose we are using Parcel starter kit but feel free to use any other tool or starter kit.

git clone git@github.com:brandiqa/react-parcel-starter.git lwc-react
cd lwc-react
npm install

To run your project simply

npm start

This will create a web page accessible by default on http://localhost:1234.

Creating a charting component
The example React component on this page may not fit your requirements completely. Creating a general purpose declarative wrapper for Lightweight Charts™ imperative API is a challenge, but hopefully you can adapt this example to your use case.

info
For this example we are using props to set chart colors based on the current theme (light or dark). In your real code it might be a better idea to use a Context.


import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const ChartComponent = props => {
    const {
        data,
        colors: {
            backgroundColor = 'black',
            lineColor = '#2962FF',
            textColor = 'white',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const chartContainerRef = useRef();

    useEffect(
        () => {
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            };

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                },
                width: chartContainerRef.current.clientWidth,
                height: 300,
            });
            chart.timeScale().fitContent();

            const newSeries = chart.addSeries(AreaSeries, { lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
            newSeries.setData(data);

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    return (
        <div
            ref={chartContainerRef}
        />
    );
};

const initialData = [
    { time: '2018-12-22', value: 32.51 },
    { time: '2018-12-23', value: 31.11 },
    { time: '2018-12-24', value: 27.02 },
    { time: '2018-12-25', value: 27.32 },
    { time: '2018-12-26', value: 25.17 },
    { time: '2018-12-27', value: 28.89 },
    { time: '2018-12-28', value: 25.46 },
    { time: '2018-12-29', value: 23.92 },
    { time: '2018-12-30', value: 22.68 },
    { time: '2018-12-31', value: 22.67 },
];

export function App(props) {
    return (
        <ChartComponent {...props} data={initialData}></ChartComponent>
    );
}

and you'll have a reusable component that could then be enhanced, tweaked to meet your needs, adding properties and even functionalities.

If you've successfully followed all the steps you should see something similar to



React - Advanced example
info
The following describes a more complex scenario where a user could imagine splitting the responsibilities of the chart between components.

If you want to consult a simpler approach please consult this example.

warning
By following the steps below we assume you're familiar with Lightweight Charts™, how to set up a project using it and how to render a chart.

If not, please follow this guide.

If you're familiar with Lightweight Charts™ you probably already know that a Chart is a container that can contain one or more Series. Each Series has its own options (for instance AreaStyleOptions, LineStyleOptions, etc) in addition to price and/or time scale.

Based on this principle, one could easily imagine having a main component Chart that could have some Series children that could themselves have other children and so on. Therefore the structure could become something like

<Chart component>
    <Series component 1>
        <child component />
    </Series component 1>
    <Series component n>
        <child component />
    </Series component n>
</Chart component>

Even though it's possible to create a Chart without a Series, the complexity arises when another component wants to interact with any of its siblings/parent, like updating a series by adding more data or resizing the chart itself.

Given this tutorial is about React this is how we are going to define components relying on React Hooks and composition.

However, one drawback with the way React and its hooks like useEffect work in a parent/children implementation is that their respective hooks are called in a bottom-up order for instanciation but top-to-bottom when it comes to clean-up.

The following skeleton illustrates the mechanism.

import React, { useEffect } from 'react';

export const ParentComponent = () => {
    // this effect will be triggered in position 3
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 1
        }
    , []);

    // this effect will be triggered in position 4
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 2
        }
    , []);

    // The parent will then return Following bit is to propagate all props & internalRef object down to children
    return (
        <ChildComponent />
    );
};
ParentComponent.displayName = 'ParentComponent';

export const ChildComponent = () => {
    // this effect will be triggered in position 1
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 3
        }
    , []);

    // this effect will be triggered in position 2
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 4
        }
    , []);

    return (
        <div />
    );
};
ChildComponent.displayName = 'ChildComponent';

In essence, taking the example above, it means that a ChildComponent (aka Series) would be created first whilst requiring a ParentComponent (aka Chart).

To achieve that, we will have to rely on a few hooks and take advantage of the way they work in addition to use ref/forwardRef which is a technique to pass down properties from one component to its children.

In the end the "visible" structure and usage will be alike but internally it will be something like:

<Chart component>
    <ChartContainer>
        <Series component 1>
            <child component />
        </Series component 1>
        <Series component n>
            <child component />
        </Series component n>
    </ChartContainer>
</Chart component>

where the ChartContainer's role would be needed to attach a DOMElement on which the chart will render. ChartContainer will be responsible for creating a reference that will hold functions to handle the lifecycle of the chart. That reference will then be propagated down to the Series.

The same technique will be used within the Series component to handle this time the lifecycle of any Series along with adding data to be plotted.

Moreover those 2 "main" components will "expose" whatever functions the user wants from the internal reference object at a higher level, meaning once those references are accessible any other component would then be able to act on either the Chart or any Series.

Here's a skeleton of what the final structure would be like:

import React, { useEffect, useImperativeHandle, useRef, createContext, forwardRef } from 'react';

const Context = createContext();

export const MainComponent = props =>
    // Creates the first reference and instanciate a ParentComponent
    (
        <div ref={chartReference}>
            <ParentComponent {...props} container={container} />
        </div>
    );

export const ParentComponent = forwardRef((props, ref) => {
    const internalRef = useRef({
        method1() {
            // This function would be responsible for creating the chart for instance
        },
        methodn() {
            // This function would be responsible for cleaning up the chart
        },
    });

    // this effect will be triggered in position 3
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 1
        }
    , []);

    // this effect will be triggered in position 4
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 2
        }
    , []);

    useImperativeHandle(ref, () => {
        // That's the hook responsible for exposing part of/entirety of internalRef
    }, []);

    // Following bit is to propagate all props & internalRef object down to children
    return (
        <Context.Provider value={internalRef.current}>
            {props.children}
        </Context.Provider>
    );
});
ParentComponent.displayName = 'ParentComponent';

export const ChildComponent = forwardRef((props, ref) => {
    const internalRef = useRef({
        method1() {
            // This function would be responsible for creating a series
        },
        methodn() {
            // This function would be responsible for removing it
        },
    });

    // this effect will be triggered in position 1
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 3
        }
    , []);

    // this effect will be triggered in position 2
    useEffect(() =>
        () => {
            // this clean up will be triggered in position 4
        }
    , []);

    useImperativeHandle(ref, () => {
        // That's the hook responsible for exposing part of/entirety of internalRef
    }, []);

    // Following bit is to propagate all props & internalRef object down to children
    return (
        <Context.Provider value={internalRef.current}>
            {props.children}
        </Context.Provider>
    );
});
ChildComponent.displayName = 'ChildComponent';

By considering all the above you could end up with Chart/Series components looking like the following

info
For this example we are using props to set chart colors based on the current theme (light or dark). In your real code it might be a better idea to use a Context.


import { createChart, LineSeries, AreaSeries } from 'lightweight-charts';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const Context = createContext();

const initialData = [
    { time: '2018-10-11', value: 52.89 },
    { time: '2018-10-12', value: 51.65 },
    { time: '2018-10-13', value: 51.56 },
    { time: '2018-10-14', value: 50.19 },
    { time: '2018-10-15', value: 51.86 },
    { time: '2018-10-16', value: 51.25 },
];

const initialData2 = [
    { time: '2018-10-11', value: 42.89 },
    { time: '2018-10-12', value: 41.65 },
    { time: '2018-10-13', value: 41.56 },
    { time: '2018-10-14', value: 40.19 },
    { time: '2018-10-15', value: 41.86 },
    { time: '2018-10-16', value: 41.25 },
];
const currentDate = new Date(initialData[initialData.length - 1].time);

export const App = props => {
    const {
        colors: {
            backgroundColor = 'black',
            lineColor = '#2962FF',
            textColor = 'white',
        } = {},
    } = props;

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    // The following variables illustrate how a series could be updated.
    const series1 = useRef(null);
    const series2 = useRef(null);
    const [started, setStarted] = useState(false);
    const [isSecondSeriesActive, setIsSecondSeriesActive] = useState(false);

    // The purpose of this effect is purely to show how a series could
    // be updated using the `reference` passed to the `Series` component.
    useEffect(() => {
        if (series1.current === null) {
            return;
        }
        let intervalId;

        if (started) {
            intervalId = setInterval(() => {
                currentDate.setDate(currentDate.getDate() + 1);
                const next = {
                    time: currentDate.toISOString().slice(0, 10),
                    value: 53 - 2 * Math.random(),
                };
                series1.current.update(next);
                if (series2.current) {
                    series2.current.update({
                        ...next,
                        value: 43 - 2 * Math.random(),
                    });
                }
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [started]);

    useEffect(() => {
        setChartLayoutOptions({
            background: {
                color: backgroundColor,
            },
            textColor,
        });
    }, [backgroundColor, textColor]);

    return (
        <>
            <button type="button" onClick={() => setStarted(current => !current)}>
                {started ? 'Stop updating' : 'Start updating series'}
            </button>
            <button type="button" onClick={() => setIsSecondSeriesActive(current => !current)}>
                {isSecondSeriesActive ? 'Remove second series' : 'Add second series'}
            </button>
            <Chart layout={chartLayoutOptions}>
                <Series
                    ref={series1}
                    type={'line'}
                    data={initialData}
                    color={lineColor}
                />
                {isSecondSeriesActive && <Series
                    ref={series2}
                    type={'area'}
                    data={initialData2}
                    color={lineColor}
                />}
            </Chart>
        </>
    );
};

export function Chart(props) {
    const [container, setContainer] = useState(false);
    const handleRef = useCallback(ref => setContainer(ref), []);
    return (
        <div ref={handleRef}>
            {container && <ChartContainer {...props} container={container} />}
        </div>
    );
}

export const ChartContainer = forwardRef((props, ref) => {
    const { children, container, layout, ...rest } = props;

    const chartApiRef = useRef({
        isRemoved: false,
        api() {
            if (!this._api) {
                this._api = createChart(container, {
                    ...rest,
                    layout,
                    width: container.clientWidth,
                    height: 300,
                });
                this._api.timeScale().fitContent();
            }
            return this._api;
        },
        free(series) {
            if (this._api && series) {
                this._api.removeSeries(series);
            }
        },
    });

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        const chart = currentRef.api();

        const handleResize = () => {
            chart.applyOptions({
                ...rest,
                width: container.clientWidth,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chartApiRef.current.isRemoved = true;
            chart.remove();
        };
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api();
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api().applyOptions(rest);
    }, []);

    useImperativeHandle(ref, () => chartApiRef.current.api(), []);

    useEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api().applyOptions({ layout });
    }, [layout]);

    return (
        <Context.Provider value={chartApiRef.current}>
            {props.children}
        </Context.Provider>
    );
});
ChartContainer.displayName = 'ChartContainer';

export const Series = forwardRef((props, ref) => {
    const parent = useContext(Context);
    const context = useRef({
        api() {
            if (!this._api) {
                const { children, data, type, ...rest } = props;
                this._api =
                    type === 'line'
                        ? parent.api().addSeries(LineSeries, rest)
                        : parent.api().addSeries(AreaSeries, rest);
                this._api.setData(data);
            }
            return this._api;
        },
        free() {
            // check if parent component was removed already
            if (this._api && !parent.isRemoved) {
                // remove only current series
                parent.free(this._api);
            }
        },
    });

    useLayoutEffect(() => {
        const currentRef = context.current;
        currentRef.api();

        return () => currentRef.free();
    }, []);

    useLayoutEffect(() => {
        const currentRef = context.current;
        const { children, data, ...rest } = props;
        currentRef.api().applyOptions(rest);
    });

    useImperativeHandle(ref, () => context.current.api(), []);

    return (
        <Context.Provider value={context.current}>
            {props.children}
        </Context.Provider>
    );
});
Series.displayName = 'Series';

The code above will produce a line series. Given a series1 reference is created to be passed to the Series component you could reuse that object via series1.current.[any function applicable on Series].

For instance and as shown below series1.current.update(new data) is used upon clicking on the button.

Web Components - Custom Element
info
The following describes a relatively simple example that only allows for a single series to be rendered. This example can be used as a starting point, and could be tweaked further using our extensive API.

This guide will focus on the key concepts required to get Lightweight Charts™ running within a Vanilla JS web component (using custom elements). Please note this guide is not intended as a complete step-by-step tutorial. The example web component custom element can be found at the bottom of this guide.

If you are new to Web Components then please have a look at the following resources before proceeding further with this example.

MDN: Using Custom Elements
Custom Elements Best Practices
Open Web Components
About the example custom element
The example Web Components custom element has the following features.

The ability to:

specify the series type via a component attribute,
specify the series data via a component property,
control the chart, series, time scale, and price scale options via properties,
enable automatic resizing of the chart when the browser is resized.
The example may not fit your requirements completely. Creating a general-purpose declarative wrapper for Lightweight Charts™ imperative API is a challenge, but hopefully, you can adapt this example to your use case.

Component showcase
Presented below is the finished wrapper custom element which is discussed throughout this guide. The interactive buttons beneath the chart are showcasing how to interact with the component and that code is provided below as well (within the example app custom element).

Set Random Colors Change Chart Type Change Data
Creating the chart
Web Components are a suite of different technologies which allow you to encapsulate functionality within custom elements. Custom elements make use of the standard web languages html, css, and js which means that there aren't many specific changes, or extra knowledge, required to get Lightweight Charts™ working within a custom element.

The process of creating a chart is essentially the same as when using the library normally, except that we are encapsulating all the html, css, and js code specific to the chart within our custom element.

Starting with a simple boilerplate custom element, as shown below:

(function() {
    class LightweightChartWC extends HTMLElement {
        connectedCallback() {
            this.attachShadow({ mode: 'open' });
        }

        disconnectedCallback() {}
    }

    // Register our custom element with a specific tag name.
    window.customElements.define('lightweight-chart', LightweightChartWC);
})();

The first step is to define the html for the custom element. For Lightweight Charts, all we need to do is create a div element to act as our container element. You can create the html by cloning a template (as seen in our usage example below) or by imperatively using the DOM JS api as shown below:

    // Within the class definition
    connectedCallback() {
        // Create the div container for the chart
        const container = document.createElement('div');
        container.setAttribute('class', 'chart-container');

        this.shadowRoot.append(container);
    }

Next we will want to define some basic styles to ensure that the container element fills the available space and that the element can be hidden using the hidden attribute.

// Outside of the Class definition
const elementStyles = `
    :host {
        display: block;
    }
    :host[hidden] {
        display: none;
    }
    .chart-container {
        height: 100%;
        width: 100%;
    }
`;

// ...

    // Within the class definition
    connectedCallback() {
        // create the stylesheet for the custom element
        const style = document.createElement('style');
        style.textContent = elementStyles;
        this.shadowRoot.append(style, container);
    }

Finally, we can now create the chart using Lightweight Charts™. Depending on your build process, you may either need to import Lightweight Charts™, or access it from the global scope (if loaded as a standalone script). To create the chart, we call the createChart constructor function, passing our container element as the first argument. The returned variable will be a IChartApi instance which we can use as shown in the API documentation. The IChartApi instance provides all the required functionality to create series, assign data, and more. See our Getting started guide for a quick example.

    connectedCallback() {

        // Create the Lightweight Chart
        this.chart = createChart(container);
    }

Attributes and properties
Whilst we could encapsulate everything required to create a chart within the custom element, generally we wish to allow further customisation of the chart to the consumers of the custom element. Attributes and properties are a great way to provide this 'API' to the consumer.

As a general rule of thumb, it is better to use attributes for options which are defined using simple values (number, string, boolean), and properties for rich data types.

In our example, we will be using attributes for the series type option (type) and the autosize flag which enables automatic resizing of the chart when the window is resized. We will be using properties to provide the interfaces for setting the series data, and options for the chart. Additionally, the IChartApi instance will be accessable via the chart property such that the consumer has full access to the entire API provided by Lightweight Charts™.

Attributes
Attributes for the custom element can be set directly on the custom element (within the html), or via javascript as seen for the properties in the next section.

<lightweight-chart autosize type="area"></lightweight-chart>

Attributes can be set and read from within the custom element's definition as follows:

// read `type` attribute
const type = this.getAttribute('type');

// set `type` attribute
this.setAttribute('type', 'line');

It is recommended that attributes be mirrored as properties on the custom element (and reflected such that any changes appear on the html as well). This can be achieved as follows:

    // Within the class definition
    set type(value) {
        this.setAttribute('type', value || 'line');
    }

    get type() {
        return this.getAttribute('type') || 'line';
    }

We can observe any changes to an attribute by defining the static observedAttributes getter on the custom element and the attributeChangedCallback method on the class definition.

class LightweightChartWC extends HTMLElement {
    // Attributes to observe. When changes occur, `attributeChangedCallback` is called.
    static get observedAttributes() {
        return ['type', 'autosize'];
    }

    /**
     * `attributeChangedCallback()` is called when any of the attributes in the
     * `observedAttributes` array are changed.
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        if (!this.chart) {
            return;
        }
        const hasValue = newValue !== null;
        switch (name) {
        case 'type':
            // handle the changed attribute
            break;
        case 'autosize':
            // handle the changed attribute
            break;
        }
    }
}

Properties
Properties for the custom element are read and set through javascript on a reference to a custom element's instance. This instance can be created using standard DOM methods such as querySelector.

// Get a reference to an instance of the custom element on the page
const myChartElement = document.querySelector('lightweight-chart');

// read the data property
const currentData = myChartElement.data;

// set the seriesOptions property
myChartElement.seriesOptions = {
    color: 'blue',
};

We can define setters and getters for the properties if we need more control over the property instead of it being just a value.

    // Within the class definition
    set options(value) {
        if (!this.chart) {
            return;
        }
        this.chart.applyOptions(value);
    }

    get options() {
        if (!this.chart) {
            return null;
        }
        return this.chart.options();
    }

As mentioned earlier, it is recommended that any API which accepts complex (or rich data) beyond a simple string, number, or boolean value should be property. However, since properties can only be set via javascript there may be cases where it would be preferable to define these values within the html markup. We can provide an attribute interface for these properties which can be used to define the initial values, then remove those attributes from the markup and ignore any further changes to those attributes.

    /**
     * Any data properties which are provided as JSON string values
     * when the component is attached to the DOM will be used as the
     * initial values for those properties.
     *
     * Note: once the component is attached, then any changes to these
     * attributes will be ignored (not observed), and should rather be
     * set using the property directly.
     */
    _tryLoadInitialProperty(name) {
        if (this.hasAttribute(name)) {
            const valueString = this.getAttribute(name);
            let value;
            try {
                value = JSON.parse(valueString);
            } catch (error) {
                console.error(
                    `Unable to read attribute ${name}'s value during initialisation.`
                );
                return;
            }
            // change kebab case attribute name to camel case.
            const propertyName = name
                .split('-')
                .map((text, index) => {
                    if (index < 1) {
                        return text;
                    }
                    return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
                })
                .join('');
            this[propertyName] = value;
            this.removeAttribute(name);
        }
    }

    connectedCallback() {
        // ...

        // Read initial values using attributes and then clear the attributes
        // since we don't want to 'reflect' data properties onto the elements
        // attributes.
        const richDataProperties = [
            'options',
            'series-options',
            'pricescale-options',
            'timescale-options',
        ];
        richDataProperties.forEach(propertyName => {
            this._tryLoadInitialProperty(propertyName);
        });
    }

These attributes can be used to define the initial values for the properties as follows (using JSON notation):

<lightweight-chart
    data='[{"time": "2022-09-14", "value": 123.45},{"time": "2022-09-15", "value": 123.45}]'
    series-options='{"color":"blue"}'
></lightweight-chart>

Accessing the chart instance or additional methods
The IChartApi instance will be accessible via the chart property on the custom element. This can be used by the consumer of the custom element to fully control the chart within the element.

// Get a reference to an instance of the custom element on the page
const myChartElement = document.querySelector('lightweight-chart');

const chartApi = myChartElement.chart;

// For example, call the `fitContent` method on the time scale
chartApi.timeScale().fitContent();

Using a Custom Element
Custom elements can be used just like any other normal html element after the custom element has been defined and registered. The example custom element will define and register itself (using window.customElements.define('lightweight-chart', LightweightChartWC);) when the script is loaded and executed, so all you need to do is include the script tag on the page.

Depending on your build step for your page, you may either need to import Lightweight Charts™ via an import statement, or access the library via the global variable defined when using the standalone script version.

// if using esm version (installed via npm):
// import { createChart } from 'lightweight-charts';

// If using standalone version (loaded via a script tag):
const { createChart } = LightweightCharts;

Similarily, the custom element can either be loaded via an 'side-effect' import statement:

// side-effect import statement (use within a module js file)
import './lw-chart.js';

or via a script tag:

<script src="lw-chart.js" defer></script>

Once the custom element script has been loaded and executed then you can use the custom element anywhere that you can use normal html, including within other frameworks like React, Vue, and Angular. See Custom Elements Everywhere for more information.

Standalone script example html file
If you are loading the Lightweight Charts™ library via the standalone script version then you can also load the custom element via a script tag (see above section for more info) and construct your html page as follows:

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0"
        />
        <title>Web component Example</title>
        <script
            type="text/javascript"
            src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.development.js"
        ></script>
        <style>
            #my-chart {
                height: 100vh;
                width: 100vw;
            }
        </style>
    </head>

    <body style="padding: 0; margin: 0">
        <lightweight-chart
            id="my-chart"
            autosize
            type="line"
            series-options='{"color": "red"}'
            data='[{ "time": "2018-10-19", "value": 52.89 },{ "time": "2018-10-22", "value": 51.65 }]'
        ></lightweight-chart>

        <script src="lw-chart.js" defer></script>
    </body>
</html>

Complete Sample Code
Presented below is the complete custom element source code for the Web component. We have also provided a sample custom element component which showcases how to make use of these components within a typical html page.

Wrapper Custom Element
The following code block contains the source code for the wrapper custom element.

Download file


Click here to reveal the code.
// if using esm version (installed via npm):
import { createChart, LineSeries, AreaSeries, CandlestickSeries, BaselineSeries, HistogramSeries, BarSeries } from 'lightweight-charts';

// If using standalone version (loaded via a script tag):
// const { createChart } = LightweightCharts;

(function() {
    // Styles for the custom element
    const elementStyles = `
                    :host {
                        display: block;
                    }
                    :host[hidden] {
                        display: none;
                    }
                    .chart-container {
                        height: 100%;
                        width: 100%;
                    }
                `;

    // Class definition for the custom element
    class LightweightChartWC extends HTMLElement {
        // Attributes to observe. When changes occur, `attributeChangedCallback` is called.
        static get observedAttributes() {
            return ['type', 'autosize'];
        }

        static getChartSeriesDefinition(type) {
            switch (type) {
                case 'line':
                    return LineSeries;
                case 'area':
                    return AreaSeries;
                case 'candlestick':
                    return CandlestickSeries;
                case 'baseline':
                    return BaselineSeries;
                case 'bar':
                    return BarSeries;
                case 'histogram':
                    return HistogramSeries;
            }
            throw new Error(`${type} is an unsupported series type`);
        }

        constructor() {
            super();
            this.chart = undefined;
            this.series = undefined;
            this.__data = [];
            this._resizeEventHandler = () => this._resizeHandler();
        }

        /**
         * `connectedCallback()` fires when the element is inserted into the DOM.
         */
        connectedCallback() {
            this.attachShadow({ mode: 'open' });

            /**
             * Attributes you may want to set, but should only change if
             * not already specified.
             */
            // if (!this.hasAttribute('tabindex'))
            // this.setAttribute('tabindex', -1);

            // A user may set a property on an _instance_ of an element,
            // before its prototype has been connected to this class.
            // The `_upgradeProperty()` method will check for any instance properties
            // and run them through the proper class setters.
            this._upgradeProperty('type');
            this._upgradeProperty('autosize');

            // We load the data attribute before creating the chart
            // so the `setTypeAndData` method can have an initial value.
            this._tryLoadInitialProperty('data');

            // Create the div container for the chart
            const container = document.createElement('div');
            container.setAttribute('class', 'chart-container');
            // create the stylesheet for the custom element
            const style = document.createElement('style');
            style.textContent = elementStyles;
            this.shadowRoot.append(style, container);

            // Create the Lightweight Chart
            this.chart = createChart(container);
            this.setTypeAndData();

            // Read initial values using attributes and then clear the attributes
            // since we don't want to 'reflect' data properties onto the elements
            // attributes.
            const richDataProperties = [
                'options',
                'series-options',
                'pricescale-options',
                'timescale-options',
            ];
            richDataProperties.forEach(propertyName => {
                this._tryLoadInitialProperty(propertyName);
            });

            if (this.autosize) {
                window.addEventListener('resize', this._resizeEventHandler);
            }
        }

        /**
         * Any data properties which are provided as JSON string values
         * when the component is attached to the DOM will be used as the
         * initial values for those properties.
         *
         * Note: once the component is attached, then any changes to these
         * attributes will be ignored (not observed), and should rather be
         * set using the property directly.
         */
        _tryLoadInitialProperty(name) {
            if (this.hasAttribute(name)) {
                const valueString = this.getAttribute(name);
                let value;
                try {
                    value = JSON.parse(valueString);
                } catch (error) {
                    console.error(
                        `Unable to read attribute ${name}'s value during initialisation.`
                    );
                    return;
                }
                // change kebab case attribute name to camel case.
                const propertyName = name
                    .split('-')
                    .map((text, index) => {
                        if (index < 1) {return text;}
                        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
                    })
                    .join('');
                this[propertyName] = value;
                this.removeAttribute(name);
            }
        }

        // Create a chart series (according to the 'type' attribute) and set it's data.
        setTypeAndData() {
            if (this.series && this.chart) {
                this.chart.removeSeries(this.series);
            }
            this.series =
                this.chart.addSeries(LightweightChartWC.getChartSeriesDefinition(this.type));
            this.series.setData(this.data);
        }

        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                const value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }

        /**
         * `disconnectedCallback()` fires when the element is removed from the DOM.
         * It's a good place to do clean up work like releasing references and
         * removing event listeners.
         */
        disconnectedCallback() {
            if (this.chart) {
                this.chart.remove();
                this.chart = null;
            }
            window.removeEventListener('resize', this._resizeEventHandler);
        }

        /**
         * Reflected Properties
         *
         * These Properties and their corresponding attributes should mirror one another.
         */
        set type(value) {
            this.setAttribute('type', value || 'line');
        }

        get type() {
            return this.getAttribute('type') || 'line';
        }

        set autosize(value) {
            const autosize = Boolean(value);
            if (autosize) {this.setAttribute('autosize', '');} else {this.removeAttribute('autosize');}
        }

        get autosize() {
            return this.hasAttribute('autosize');
        }

        /**
         * Rich Data Properties
         *
         * These Properties are not reflected to a corresponding attribute.
         */
        set data(value) {
            let newData = value;
            if (typeof newData !== 'object' || !Array.isArray(newData)) {
                newData = [];
                console.warn('Lightweight Charts: Data should be an array');
            }
            this.__data = newData;
            if (this.series) {
                this.series.setData(this.__data);
            }
        }

        get data() {
            return this.__data;
        }

        set options(value) {
            if (!this.chart) {return;}
            this.chart.applyOptions(value);
        }

        get options() {
            if (!this.chart) {return null;}
            return this.chart.options();
        }

        set seriesOptions(value) {
            if (!this.series) {return;}
            this.series.applyOptions(value);
        }

        get seriesOptions() {
            if (!this.series) {return null;}
            return this.series.options();
        }

        set priceScaleOptions(value) {
            if (!this.chart) {return;}
            this.chart.priceScale().applyOptions(value);
        }

        get priceScaleOptions() {
            if (!this.series) {return null;}
            return this.chart.priceScale().options();
        }

        set timeScaleOptions(value) {
            if (!this.chart) {return;}
            this.chart.timeScale().applyOptions(value);
        }

        get timeScaleOptions() {
            if (!this.series) {return null;}
            return this.chart.timeScale().options();
        }

        /**
         * `attributeChangedCallback()` is called when any of the attributes in the
         * `observedAttributes` array are changed.
         */
        attributeChangedCallback(name, _oldValue, newValue) {
            if (!this.chart) {return;}
            const hasValue = newValue !== null;
            switch (name) {
                case 'type':
                    this.data = [];
                    this.setTypeAndData();
                    break;
                case 'autosize':
                    if (hasValue) {
                        window.addEventListener('resize', () => this._resizeEventHandler);
                        // call once when added to an existing element
                        this._resizeEventHandler();
                    } else {
                        window.removeEventListener('resize', this._resizeEventHandler);
                    }
                    break;
            }
        }

        _resizeHandler() {
            const container = this.shadowRoot.querySelector('div.chart-container');
            if (!this.chart || !container) {return;}
            const dimensions = container.getBoundingClientRect();
            this.chart.resize(dimensions.width, dimensions.height);
        }
    }

    window.customElements.define('lightweight-chart', LightweightChartWC);
})();


Example Usage Custom Element
The following code block contains the source code for the custom element showcasing how to use the above custom element.

Download file


Click here to reveal the code.
import './lw-chart.js';
import { themeColors } from '../../../theme-colors';

(function() {
    const template = document.createElement('template');
    template.innerHTML = `
    <style>
    :host {
        display: block;
    }
    :host[hidden] {
        display: none;
    }
    #example {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }
    #chart {
        flex-grow: 1;
    }
    #buttons {
        flex-direction: row;
    }
    button {
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.5em 1em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: var(--hero-button-background-color-active, #e9e9e9);
        color: var(--hero-button-text-color, #e9e9e9);
        cursor: pointer;
        transition: border-color 0.25s;
        margin-left: 0.5em;
      }
      button:hover {
        border-color: #3179F5;
        background-color: var(--hero-button-background-color-hover);
        color: var(--hero-button-text-color-hover-active);
      }
      button:focus,
      button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
      }
        
      #example-chart {
        height: var(--lwchart-height, 300px);
      }
    </style>
    <div id="example">
        <div id="example-container">
            <lightweight-chart id="example-chart"
                autosize
                type="line"
            ></lightweight-chart>
        </div>
        <div id="buttons">
            <button id="change-colours-button" type="button">Set Random Colors</button>
            <button id="change-type-button" type="button">Change Chart Type</button>
            <button id="change-data-button" type="button">Change Data</button>
        </div>
    </div>
  `;

    function generateSampleData(ohlc) {
        const randomFactor = 25 + Math.random() * 25;
        const samplePoint = i =>
            i *
                (0.5 +
                    Math.sin(i / 10) * 0.2 +
                    Math.sin(i / 20) * 0.4 +
                    Math.sin(i / randomFactor) * 0.8 +
                    Math.sin(i / 500) * 0.5) +
            200;

        const res = [];
        const date = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
        const numberOfPoints = ohlc ? 100 : 500;
        for (let i = 0; i < numberOfPoints; ++i) {
            const time = date.getTime() / 1000;
            const value = samplePoint(i);
            if (ohlc) {
                const randomRanges = [
                    -1 * Math.random(),
                    Math.random(),
                    Math.random(),
                ].map(j => j * 10);
                const sign = Math.sin(Math.random() - 0.5);
                res.push({
                    time,
                    low: value + randomRanges[0],
                    high: value + randomRanges[1],
                    open: value + sign * randomRanges[2],
                    close: samplePoint(i + 1),
                });
            } else {
                res.push({
                    time,
                    value,
                });
            }

            date.setUTCDate(date.getUTCDate() + 1);
        }

        return res;
    }

    const randomShade = () => Math.round(Math.random() * 255);

    const randomColor = (alpha = 1) =>
        `rgba(${randomShade()}, ${randomShade()}, ${randomShade()}, ${alpha})`;

    const colorsTypeMap = {
        area: [
            ['topColor', 0.4],
            ['bottomColor', 0],
            ['lineColor', 1],
        ],
        bar: [
            ['upColor', 1],
            ['downColor', 1],
        ],
        baseline: [
            ['topFillColor1', 0.28],
            ['topFillColor2', 0.05],
            ['topLineColor', 1],
            ['bottomFillColor1', 0.28],
            ['bottomFillColor2', 0.05],
            ['bottomLineColor', 1],
        ],
        candlestick: [
            ['upColor', 1],
            ['downColor', 1],
            ['borderUpColor', 1],
            ['borderDownColor', 1],
            ['wickUpColor', 1],
            ['wickDownColor', 1],
        ],
        histogram: [['color', 1]],
        line: [['color', 1]],
    };

    const checkPageTheme = () =>
        document.documentElement.getAttribute('data-theme') === 'dark';

    class LightweightChartExampleWC extends HTMLElement {
        constructor() {
            super();
            this.chartElement = undefined;
        }

        connectedCallback() {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this.changeChartTheme(checkPageTheme());

            if (window.MutationObserver) {
                const callback = _ => {
                    this.changeChartTheme(checkPageTheme());
                };
                this.observer = new window.MutationObserver(callback);
                this.observer.observe(document.documentElement, { attributes: true });
            }

            this.chartElement = this.shadowRoot.querySelector('#example-chart');
            this._changeData();

            this.addButtonClickHandlers();
            this.chartElement.chart.timeScale().fitContent();
        }

        addButtonClickHandlers() {
            this.changeColours = () => this._changeColours();
            this.changeType = () => this._changeType();
            this.changeData = () => this._changeData();
            this.shadowRoot
                .querySelector('#change-colours-button')
                .addEventListener('click', this.changeColours);
            this.shadowRoot
                .querySelector('#change-type-button')
                .addEventListener('click', this.changeType);
            this.shadowRoot
                .querySelector('#change-data-button')
                .addEventListener('click', this.changeData);
        }

        removeButtonClickHandlers() {
            if (this.changeColours) {
                this.shadowRoot
                    .querySelector('#change-colours-button')
                    .removeEventListener('click', this.changeColours);
            }
            if (this.changeType) {
                this.shadowRoot
                    .querySelector('#change-type-button')
                    .removeEventListener('click', this.changeType);
            }
            if (this.changeData) {
                this.shadowRoot
                    .querySelector('#change-data-button')
                    .removeEventListener('click', this.changeData);
            }
        }

        _changeColours() {
            if (!this.chartElement) {
                return;
            }
            const options = {};
            const colorsToSet = colorsTypeMap[this.chartElement.type];
            colorsToSet.forEach(c => {
                options[c[0]] = randomColor(c[1]);
            });
            this.chartElement.seriesOptions = options;
        }

        _changeData() {
            if (!this.chartElement) {
                return;
            }
            const candlestickTypeData = ['candlestick', 'bar'].includes(
                this.chartElement.type
            );
            const newData = generateSampleData(candlestickTypeData);
            this.chartElement.data = newData;
            if (this.chartElement.type === 'baseline') {
                const average =
                    newData.reduce((s, c) => s + c.value, 0) / newData.length;
                this.chartElement.seriesOptions = {
                    baseValue: { type: 'price', price: average },
                };
            }
        }

        _changeType() {
            if (!this.chartElement) {
                return;
            }
            const types = [
                'line',
                'area',
                'baseline',
                'histogram',
                'candlestick',
                'bar',
            ].filter(t => t !== this.chartElement.type);
            const randIndex = Math.round(Math.random() * (types.length - 1));
            this.chartElement.type = types[randIndex];
            this._changeData();

            // call a method on the component.
            this.chartElement.chart.timeScale().fitContent();
        }

        disconnectedCallback() {}

        changeChartTheme(isDark) {
            if (!this.chartElement) {
                return;
            }
            const theme = isDark ? themeColors.DARK : themeColors.LIGHT;
            const gridColor = isDark ? '#424F53' : '#D6DCDE';
            this.chartElement.options = {
                layout: {
                    textColor: theme.CHART_TEXT_COLOR,
                    background: {
                        color: theme.CHART_BACKGROUND_COLOR,
                    },
                },
                grid: {
                    vertLines: {
                        color: gridColor,
                    },
                    horzLines: {
                        color: gridColor,
                    },
                },
            };
        }
    }

    window.customElements.define(
        'lightweight-chart-example',
        LightweightChartExampleWC
    );
})();


Custom horizontal scale
The IHorzScaleBehavior interface allows you to customize the behavior of the horizontal scale. By default, this scale uses time values, but you can override it to use any other type of horizontal scale items, such as price values. The most typical use case is the creation of Options charts.

This guide will explain the IHorzScaleBehavior interface and how to implement it to create a horizontal scale using price values with customizable precision.

Understanding the IHorzScaleBehavior interface
The IHorzScaleBehavior interface consists of several methods that you need to implement to customize the horizontal scale behavior. Here's a breakdown of each method and its purpose:

options
public options(): ChartOptionsImpl<HorzScaleItem>

This method returns the chart's current configuration options. These options include various settings that control the appearance and behavior of the chart. Implement this method to return the current options of your horizontal scale behavior.

setOptions
public setOptions(options: ChartOptionsImpl<HorzScaleItem>): void

This method allows you to set or update the chart's configuration options. The provided options parameter will contain the settings you want to apply. Use this method to update the options when necessary.

preprocessData
public preprocessData(data: DataItem<HorzScaleItem> | DataItem<HorzScaleItem>[]): void

This method processes the series data before it is used by the chart. It receives an array of data items or a single data item. You can implement this method to preprocess or modify data as needed before it is rendered.

updateFormatter
public updateFormatter(options: LocalizationOptions<HorzScaleItem>): void

This method updates the formatter used for displaying the horizontal scale items based on localization options. Implement this to set custom formatting settings, such as locale-specific date or number formats.

createConverterToInternalObj
public createConverterToInternalObj(data: SeriesDataItemTypeMap<HorzScaleItem>[SeriesType][]): HorzScaleItemConverterToInternalObj<HorzScaleItem>


This method creates and returns a function that converts series data items into internal horizontal scale items. Implementing this method is essential for transforming your custom data into the format required by the chart's internal mechanisms.

key
public key(internalItem: InternalHorzScaleItem | HorzScaleItem): InternalHorzScaleItemKey

This method returns a unique key for a given horizontal scale item. It's used internally by the chart to identify and manage items uniquely. Implement this method to provide a unique identifier for each item.

cacheKey
public cacheKey(internalItem: InternalHorzScaleItem): number

This method returns a cache key for a given internal horizontal scale item. This key helps the chart to cache and retrieve items efficiently. Implement this method to return a numeric key for caching purposes.

convertHorzItemToInternal
public convertHorzItemToInternal(item: HorzScaleItem): InternalHorzScaleItem

This method converts a horizontal scale item into an internal item that the chart can use. Implementing this method ensures that your custom data type is correctly transformed for internal use.

formatHorzItem
public formatHorzItem(item: InternalHorzScaleItem): string

This method formats a horizontal scale item into a display string. The returned string will be used for displaying the item on the chart. Implement this method to format your items in the desired way (e.g., with a specific number of decimal places).

formatTickmark
public formatTickmark(item: TickMark, localizationOptions: LocalizationOptions<HorzScaleItem>): string

This method formats a horizontal scale tick mark into a display string. The tick mark represents significant points on the horizontal scale. Implement this method to customize how tick marks are displayed.

maxTickMarkWeight
public maxTickMarkWeight(marks: TimeMark[]): TickMarkWeightValue

This method determines the maximum weight for a set of tick marks, which influences their display prominence. Implement this method to specify the weight of the most significant tick mark.

fillWeightsForPoints
public fillWeightsForPoints(sortedTimePoints: readonly Mutable<TimeScalePoint>[], startIndex: number): void


This method assigns weights to the sorted time points. These weights influence the tick marks' visual prominence. Implement this method to provide a weighting system for your horizontal scale items.

Example
Below is an example implementation of a custom horizontal scale behavior using price values. This example also includes customizable precision for formatting price values.

Implement price-based horizontal scale
Define the custom localization options interface
Extend the LocalizationOptions interface to include a precision property.

export interface CustomLocalizationOptions
    extends LocalizationOptions<HorzScalePriceItem> {
    precision: number;
}

Define the type alias
Define a type alias for the horizontal scale item representing price values.

export type HorzScalePriceItem = number;

Implement the custom horizontal scale behavior class
The HorzScaleBehaviorPrice class implements the IHorzScaleBehavior interface, with additional logic to handle the precision provided in the custom localization options.

function markWithGreaterWeight(a: TimeMark, b: TimeMark): TimeMark {
    return a.weight > b.weight ? a : b;
}

export class HorzScaleBehaviorPrice implements IHorzScaleBehavior<HorzScalePriceItem> {
    private _options!: ChartOptionsImpl<HorzScalePriceItem>;

    public options(): ChartOptionsImpl<HorzScalePriceItem> {
        return this._options;
    }

    public setOptions(options: ChartOptionsImpl<HorzScalePriceItem>): void {
        this._options = options;
    }

    public preprocessData(
        data: DataItem<HorzScalePriceItem> | DataItem<HorzScalePriceItem>[]
    ): void {
        // un-needed in this example because we do not require any additional
        // data processing for this scale.
        // The method is still required to be implemented in the class.
    }

    public updateFormatter(options: CustomLocalizationOptions): void {
        if (!this._options) {
            return;
        }
        this._options.localization = options;
    }

    public createConverterToInternalObj(
        data: SeriesDataItemTypeMap<HorzScalePriceItem>[SeriesType][]
    ): HorzScaleItemConverterToInternalObj<HorzScalePriceItem> {
        return (price: number) => price as unknown as InternalHorzScaleItem;
    }

    public key(
        internalItem: InternalHorzScaleItem | HorzScalePriceItem
    ): InternalHorzScaleItemKey {
        return internalItem as InternalHorzScaleItemKey;
    }

    public cacheKey(internalItem: InternalHorzScaleItem): number {
        return internalItem as unknown as number;
    }

    public convertHorzItemToInternal(
        item: HorzScalePriceItem
    ): InternalHorzScaleItem {
        return item as unknown as InternalHorzScaleItem;
    }

    public formatHorzItem(item: InternalHorzScaleItem): string {
        return (item as unknown as number).toFixed(this._precision());
    }

    public formatTickmark(
        item: TickMark,
        localizationOptions: LocalizationOptions<HorzScalePriceItem>
    ): string {
        return (item.time as unknown as number).toFixed(this._precision());
    }

    public maxTickMarkWeight(marks: TimeMark[]): TickMarkWeightValue {
        return marks.reduce(markWithGreaterWeight, marks[0]).weight;
    }

    public fillWeightsForPoints(
        sortedTimePoints: readonly Mutable<TimeScalePoint>[],
        startIndex: number
    ): void {
        const priceWeight = (price: number) => {
            if (price === Math.ceil(price / 100) * 100) {
                return 8;
            }
            if (price === Math.ceil(price / 50) * 50) {
                return 7;
            }
            if (price === Math.ceil(price / 25) * 25) {
                return 6;
            }
            if (price === Math.ceil(price / 10) * 10) {
                return 5;
            }
            if (price === Math.ceil(price / 5) * 5) {
                return 4;
            }
            if (price === Math.ceil(price)) {
                return 3;
            }
            if (price * 2 === Math.ceil(price * 2)) {
                return 1;
            }
            return 0;
        };
        for (let index = startIndex; index < sortedTimePoints.length; ++index) {
            sortedTimePoints[index].timeWeight = priceWeight(
                sortedTimePoints[index].time as unknown as number
            );
        }
    }

    private _precision(): number {
        return (this._options.localization as CustomLocalizationOptions).precision;
    }
}

This class provides additional precision control through localization options, allowing formatted price values to use a specific number of decimal places.

Customize horizontal scale behavior
To use the custom horizontal scale behavior, instantiate the HorzScaleBehaviorPrice class and pass it to createChartEx.

You can pass the custom option for precision within the localization property of the chart options.

const horzItemBehavior = new HorzScaleBehaviorPrice();
const chart = LightweightCharts.createChartEx(container, horzItemBehavior, {
    localization: {
        precision: 2, // custom option
    },
});
const s1 = chart.addSeries(LightweightCharts.LineSeries);
const data = [];
for (let i = 0; i < 5000; i++) {
    data.push({
        time: i * 0.25,
        value: Math.sin(i / 100),
    });
}
s1.setData(data);

Conclusion
The IHorzScaleBehavior interface provides a powerful way to customize the horizontal scale behavior in Lightweight Charts™. By implementing this interface, you can define how the horizontal scale should interpret and display custom data types, such as price values. The provided example demonstrates how to implement a horizontal scale with customizable precision, allowing for tailored display formats to fit your specific requirements.

Full example

How to use the code sample
function markWithGreaterWeight(a, b) {
    return a.weight > b.weight ? a : b;
}

class HorzScaleBehaviorPrice {
    constructor() {
        this._options = {};
    }

    options() {
        return this._options;
    }

    setOptions(options) {
        this._options = options;
    }

    preprocessData(data) {}

    updateFormatter(options) {
        if (!this._options) {
            return;
        }
        this._options.localization = options;
    }

    createConverterToInternalObj(data) {
        return price => price;
    }

    key(internalItem) {
        return internalItem;
    }

    cacheKey(internalItem) {
        return internalItem;
    }

    convertHorzItemToInternal(item) {
        return item;
    }

    formatHorzItem(item) {
        return item.toFixed(this._precision());
    }

    formatTickmark(item, localizationOptions) {
        return item.time.toFixed(this._precision());
    }

    maxTickMarkWeight(marks) {
        return marks.reduce(markWithGreaterWeight, marks[0]).weight;
    }

    fillWeightsForPoints(sortedTimePoints, startIndex) {
        const priceWeight = price => {
            if (price === Math.ceil(price / 100) * 100) {
                return 8;
            }
            if (price === Math.ceil(price / 50) * 50) {
                return 7;
            }
            if (price === Math.ceil(price / 25) * 25) {
                return 6;
            }
            if (price === Math.ceil(price / 10) * 10) {
                return 5;
            }
            if (price === Math.ceil(price / 5) * 5) {
                return 4;
            }
            if (price === Math.ceil(price)) {
                return 3;
            }
            if (price * 2 === Math.ceil(price * 2)) {
                return 1;
            }
            return 0;
        };
        for (let index = startIndex; index < sortedTimePoints.length; ++index) {
            sortedTimePoints[index].timeWeight = priceWeight(
                sortedTimePoints[index].time
            );
        }
    }

    _precision() {
        return this._options.localization.precision;
    }
}

const horzItemBehavior = new HorzScaleBehaviorPrice();

const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
    localization: {
        precision: 2, // custom option
    },
};

const chart = createChartEx(
    document.getElementById('container'),
    horzItemBehavior,
    chartOptions
);

const lineSeries = chart.addSeries(LineSeries, { color: '#2962FF' });

const data = [];
for (let i = 0; i < 5000; i++) {
    data.push({
        time: i * 0.25,
        value: Math.sin(i / 100) + i / 500,
    });
}

lineSeries.setData(data);

chart.timeScale().fitContent();

Price and volume on a single chart
This example shows how to include a volume study on your chart.

How to add a volume histogram
An additional series can be added to a chart as an 'overlay' by setting the series' priceScaleId to ''. An overlay doesn't make use of either the left or right price scale, and it's positioning is controlled by setting the scaleMargins property on the price scale options associated with the series.

const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
        type: 'volume',
    },
    priceScaleId: '', // set as an overlay by setting a blank priceScaleId
});
volumeSeries.priceScale().applyOptions({
    // set the positioning of the volume series
    scaleMargins: {
        top: 0.7, // highest point of the series will be 70% away from the top
        bottom: 0,
    },
});

We are using the Histogram series type to draw the volume bars. We can set the priceFormat option to 'volume' to have the values display correctly within the crosshair line label.

We adjust the position of the overlay series to the bottom 30% of the chart by setting the scaleMargins properties as follows:

volumeSeries.priceScale().applyOptions({
    scaleMargins: {
        top: 0.7, // highest point of the series will be 70% away from the top
        bottom: 0, // lowest point will be at the very bottom.
    },
});

Similarly, we can set the position of the main series using the same approach. By setting the bottom margin value to 0.4 we can ensure that the two series don't overlap each other.

mainSeries.priceScale().applyOptions({
    scaleMargins: {
        top: 0.1, // highest point of the series will be 10% away from the top
        bottom: 0.4, // lowest point will be 40% away from the bottom
    },
});

We can control the color of the histogram bars by directly specifying color inside the data set.

histogramSeries.setData([
    { time: '2018-10-19', value: 19103293.0, color: 'green' },
    { time: '2018-10-20', value: 20345000.0, color: 'red' },
]);

You can see a full working example below.

Resources
OverlayPriceScale Options
Histogram Series Type
PriceFormat Types
Scale Margins
Full example

How to use the code sample
Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
    rightPriceScale: {
        borderVisible: false,
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

const areaSeries = chart.addSeries(AreaSeries, {
    topColor: '#2962FF',
    bottomColor: 'rgba(41, 98, 255, 0.28)',
    lineColor: '#2962FF',
    lineWidth: 2,
});
areaSeries.priceScale().applyOptions({
    scaleMargins: {
        // positioning the price scale for the area series
        top: 0.1,
        bottom: 0.4,
    },
});

const volumeSeries = chart.addSeries(HistogramSeries, {
    color: '#26a69a',
    priceFormat: {
        type: 'volume',
    },
    priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    // set the positioning of the volume series
    scaleMargins: {
        top: 0.7, // highest point of the series will be 70% away from the top
        bottom: 0,
    },
});
volumeSeries.priceScale().applyOptions({
    scaleMargins: {
        top: 0.7, // highest point of the series will be 70% away from the top
        bottom: 0,
    },
});

areaSeries.setData([
    { time: '2018-10-19', value: 54.90 },
]);

// setting the data for the volume series.
// note: we are defining each bars color as part of the data
volumeSeries.setData([
    { time: '2018-10-19', value: 19103293.00, color: '#26a69a' },
]);

chart.timeScale().fitContent();


Add Series Markers
A series marker is an annotation which can be drawn on the chart at a specific point. It can be used to draw attention to specific events within the data set. This example shows how to add series markers to your chart.

Short answer
You can add markers to a series by passing an array of seriesMarker objects to the createSeriesMarkers method on an ISeriesApi instance.

const markers = [
    {
        time: { year: 2018, month: 12, day: 23 },
        position: 'aboveBar',
        color: '#f68410',
        shape: 'circle',
        text: 'A',
    },
];
createSeriesMarkers(series, markers);

You can see a full working example below.

Further information
A series marker is an annotation which can be attached to a specific data point within a series. We don't need to specify a vertical price value but rather only the time property since the marker will determine it's vertical position from the data points values (such as high and low in the case of candlestick data) and the specified position property (SeriesMarkerPosition).

Resources
You can view the related APIs here:

SeriesMarker - Series Marker interface.
SeriesMarkerPosition - Positions that can be set for the marker.
SeriesMarkerShape - Shapes that can be set for the marker.
createSeriesMarkers - Method for adding markers to a series.
Time Types - Different time formats available to use.
Full example

How to use the code sample
Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

const series = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
    wickUpColor: '#26a69a', wickDownColor: '#ef5350',
});

const data = [
    {
        time: { year: 2018, month: 9, day: 22 },
        open: 29.630237296336794,
        high: 35.36950035097501,
        low: 26.21522501353531,
        close: 30.734997177569916,
    },
];
series.setData(data);

// determining the dates for the 'buy' and 'sell' markers added below.
const datesForMarkers = [data[data.length - 39], data[data.length - 19]];
let indexOfMinPrice = 0;
for (let i = 1; i < datesForMarkers.length; i++) {
    if (datesForMarkers[i].high < datesForMarkers[indexOfMinPrice].high) {
        indexOfMinPrice = i;
    }
}

const markers = [
    {
        time: data[data.length - 48].time,
        position: 'aboveBar',
        color: '#f68410',
        shape: 'circle',
        text: 'D',
    },
];
for (let i = 0; i < datesForMarkers.length; i++) {
    if (i !== indexOfMinPrice) {
        markers.push({
            time: datesForMarkers[i].time,
            position: 'aboveBar',
            color: '#e91e63',
            shape: 'arrowDown',
            text: 'Sell @ ' + Math.floor(datesForMarkers[i].high + 2),
        });
    } else {
        markers.push({
            time: datesForMarkers[i].time,
            position: 'belowBar',
            color: '#2196F3',
            shape: 'arrowUp',
            text: 'Buy @ ' + Math.floor(datesForMarkers[i].low - 2),
        });
    }
}
/** @type {import('lightweight-charts').createSeriesMarkers} */
createSeriesMarkers(series, markers);

chart.timeScale().fitContent();


Tooltips
Lightweight Charts™ doesn't include a built-in tooltip feature, however it is something which can be added to your chart by following the examples presented below.

How to
In order to add a tooltip to the chart we need to create and position an html into the desired position above the chart. We can then subscribe to the crosshairMove events (subscribeCrosshairMove) provided by the IChartApi instance, and manually update the content within our html tooltip element and change it's position.

chart.subscribeCrosshairMove(param => {
    if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
    ) {
        toolTip.style.display = 'none';
    } else {
        const dateStr = dateToString(param.time);
        toolTip.style.display = 'block';
        const data = param.seriesData.get(series);
        const price = data.value !== undefined ? data.value : data.close;
        toolTip.innerHTML = `<div>${price.toFixed(2)}</div>`;

        // Position tooltip according to mouse cursor position
        toolTip.style.left = param.point.x + 'px';
        toolTip.style.top = param.point.y + 'px';
    }
});

The process of creating the tooltip html element and positioning can be seen within the examples below. Essentially, we create a new div element within the container div (holding the chart) and then position and style it using css.

You can see full working examples below.

Getting the mouse cursors position
The parameter object (MouseEventParams Interface) passed to the crosshairMove handler function (MouseEventhandler) contains a point property which gives the current mouse cursor position relative to the top left corner of the chart.

Getting the data points position
It is possible to convert a price value into it's current vertical position on the chart by using the priceToCoordinate method on the series' instance. This along with the param.point.x can be used to determine the position of the data point.

chart.subscribeCrosshairMove(param => {
    const x = param.point.x;
    const data = param.seriesData.get(series);
    const price = data.value !== undefined ? data.value : data.close;
    const y = series.priceToCoordinate(price);
    console.log(`The data point is at position: ${x}, ${y}`);
});

Resources
subscribeCrosshairMove
MouseEventParams Interface
MouseEventhandler
priceToCoordinate
Below are a few external resources related to creating and styling html elements:

createElement
innerHTML
style property
Examples
How to use the code sample
Floating Tooltip
The floating tooltip in this example will position itself next to the current datapoint.

Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

chart.applyOptions({
    crosshair: {
        // hide the horizontal crosshair line
        horzLine: {
            visible: false,
            labelVisible: false,
        },
        // hide the vertical crosshair label
        vertLine: {
            labelVisible: false,
        },
    },
    // hide the grid lines
    grid: {
        vertLines: {
            visible: false,
        },
        horzLines: {
            visible: false,
        },
    },
});
const series = chart.addSeries(AreaSeries, {
    topColor: '#2962FF',
    bottomColor: 'rgba(41, 98, 255, 0.28)',
    lineColor: '#2962FF',
    lineWidth: 2,
    crossHairMarkerVisible: false,
});
series.priceScale().applyOptions({
    scaleMargins: {
        top: 0.3, // leave some space for the legend
        bottom: 0.25,
    },
});

series.setData([
    { time: '2018-10-19', value: 26.19 },
]);

const container = document.getElementById('container');

const toolTipWidth = 80;
const toolTipHeight = 80;
const toolTipMargin = 15;

// Create and style the tooltip html element
const toolTip = document.createElement('div');
toolTip.style = `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
toolTip.style.background = 'black';
toolTip.style.color = 'white';
toolTip.style.borderColor = '#2962FF';
container.appendChild(toolTip);

// update tooltip
chart.subscribeCrosshairMove(param => {
    if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
    ) {
        toolTip.style.display = 'none';
    } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data = param.seriesData.get(series);
        const price = data.value !== undefined ? data.value : data.close;
        toolTip.innerHTML = `<div style="color: ${'#2962FF'}">Apple Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: ${'white'}">
            ${Math.round(100 * price) / 100}
            </div><div style="color: ${'white'}">
            ${dateStr}
            </div>`;

        const coordinate = series.priceToCoordinate(price);
        let shiftedCoordinate = param.point.x - 50;
        if (coordinate === null) {
            return;
        }
        shiftedCoordinate = Math.max(
            0,
            Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate)
        );
        const coordinateY =
            coordinate - toolTipHeight - toolTipMargin > 0
                ? coordinate - toolTipHeight - toolTipMargin
                : Math.max(
                    0,
                    Math.min(
                        container.clientHeight - toolTipHeight - toolTipMargin,
                        coordinate + toolTipMargin
                    )
                );
        toolTip.style.left = shiftedCoordinate + 'px';
        toolTip.style.top = coordinateY + 'px';
    }
});

chart.timeScale().fitContent();


Tracking Tooltip
The tracking tooltip will position itself next to the user's cursor.

Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

chart.applyOptions({
    rightPriceScale: {
        scaleMargins: {
            top: 0.3, // leave some space for the legend
            bottom: 0.25,
        },
    },
    crosshair: {
        // hide the horizontal crosshair line
        horzLine: {
            visible: false,
            labelVisible: false,
        },
        // hide the vertical crosshair label
        vertLine: {
            labelVisible: false,
        },
    },
    // hide the grid lines
    grid: {
        vertLines: {
            visible: false,
        },
        horzLines: {
            visible: false,
        },
    },
});

const series = chart.addSeries(AreaSeries, {
    topColor: 'rgba( 38, 166, 154, 0.28)',
    bottomColor: 'rgba( 38, 166, 154, 0.05)',
    lineColor: 'rgba( 38, 166, 154, 1)',
    lineWidth: 2,
    crossHairMarkerVisible: false,
});

series.setData([
    { time: '2016-07-18', value: 98.66 },
]);

const container = document.getElementById('container');

const toolTipWidth = 80;
const toolTipHeight = 80;
const toolTipMargin = 15;

// Create and style the tooltip html element
const toolTip = document.createElement('div');
toolTip.style = `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
toolTip.style.background = 'black';
toolTip.style.color = 'white';
toolTip.style.borderColor = 'rgba( 38, 166, 154, 1)';
container.appendChild(toolTip);

// update tooltip
chart.subscribeCrosshairMove(param => {
    if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
    ) {
        toolTip.style.display = 'none';
    } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data = param.seriesData.get(series);
        const price = data.value !== undefined ? data.value : data.close;
        toolTip.innerHTML = `<div style="color: ${'rgba( 38, 166, 154, 1)'}">ABC Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: ${'white'}">
            ${Math.round(100 * price) / 100}
            </div><div style="color: ${'white'}">
            ${dateStr}
            </div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > container.clientWidth - toolTipWidth) {
            left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > container.clientHeight - toolTipHeight) {
            top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + 'px';
        toolTip.style.top = top + 'px';
    }
});

chart.timeScale().fitContent();


Magnifier Tooltip
The magnifier tooltip will position itself along the top edge of the chart while following the user's cursor along the horizontal time axis.

Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

chart.applyOptions({
    leftPriceScale: {
        visible: true,
        borderVisible: false,
    },
    rightPriceScale: {
        visible: false,
    },
    timeScale: {
        borderVisible: false,
    },
    crosshair: {
        horzLine: {
            visible: false,
            labelVisible: false,
        },
        vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false,
        },
    },
    // hide the grid lines
    grid: {
        vertLines: {
            visible: false,
        },
        horzLines: {
            visible: false,
        },
    },
});

const series = chart.addSeries(AreaSeries, {
    topColor: 'rgba( 239, 83, 80, 0.05)',
    bottomColor: 'rgba( 239, 83, 80, 0.28)',
    lineColor: 'rgba( 239, 83, 80, 1)',
    lineWidth: 2,
    crossHairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false,
});
series.priceScale().applyOptions({
    scaleMargins: {
        top: 0.3, // leave some space for the legend
        bottom: 0.25,
    },
});

series.setData([
    { time: '2018-03-28', value: 154 },
]);

const container = document.getElementById('container');

const toolTipWidth = 96;

// Create and style the tooltip html element
const toolTip = document.createElement('div');
toolTip.style = `width: ${toolTipWidth}px; height: 300px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border-radius: 4px 4px 0px 0px; border-bottom: none; box-shadow: 0 2px 5px 0 rgba(117, 134, 150, 0.45);font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
toolTip.style.background = `rgba(${'0, 0, 0'}, 0.25)`;
toolTip.style.color = 'white';
toolTip.style.borderColor = 'rgba( 239, 83, 80, 1)';
container.appendChild(toolTip);

// update tooltip
chart.subscribeCrosshairMove(param => {
    if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
    ) {
        toolTip.style.display = 'none';
    } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data = param.seriesData.get(series);
        const price = data.value !== undefined ? data.value : data.close;
        toolTip.innerHTML = `<div style="color: ${'rgba( 239, 83, 80, 1)'}">⬤ ABC Inc.</div><div style="font-size: 24px; margin: 4px 0px; color: ${'white'}">
            ${Math.round(100 * price) / 100}
            </div><div style="color: ${'white'}">
            ${dateStr}
            </div>`;

        let left = param.point.x; // relative to timeScale
        const timeScaleWidth = chart.timeScale().width();
        const priceScaleWidth = chart.priceScale('left').width();
        const halfTooltipWidth = toolTipWidth / 2;
        left += priceScaleWidth - halfTooltipWidth;
        left = Math.min(left, priceScaleWidth + timeScaleWidth - toolTipWidth);
        left = Math.max(left, priceScaleWidth);

        toolTip.style.left = left + 'px';
        toolTip.style.top = 0 + 'px';
    }
});

chart.timeScale().fitContent();


Compare multiple series
This Multi-Series Comparison Example illustrates how an assortment of data series can be integrated into a single chart for comparisons. Simply use the charting API addSeries to create multiple series.

If you would like an unique price scales for each individual series, particularly when dealing with data series with divergent value ranges, then take a look at the Two Price Scales Example.


How to use the code sample
Show all code
const chartOptions = {
    layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'black' },
    },
};
const chart = createChart(document.getElementById('container'), chartOptions);

const lineSeriesOne = chart.addSeries(LineSeries, { color: '#2962FF' });

const lineSeriesTwo = chart.addSeries(LineSeries, { color: 'rgb(225, 87, 90)' });

const lineSeriesThree = chart.addSeries(LineSeries, { color: 'rgb(242, 142, 44)' });

const lineSeriesOneData = generateLineData();
const lineSeriesTwoData = generateLineData();
const lineSeriesThreeData = generateLineData();

lineSeriesOne.setData(lineSeriesOneData);
lineSeriesTwo.setData(lineSeriesTwoData);
lineSeriesThree.setData(lineSeriesThreeData);

chart.timeScale().fitContent();





Range switcher
This example illustrates the creation of a range switcher in Lightweight Charts™ that allows for changing the data set displayed based on a selected time range or interval. Different data sets representing ranges such as daily ('1D'), weekly ('1W'), monthly ('1M'), and yearly ('1Y') are prepared.

The chart begins with daily data displayed by default. Then, buttons corresponding to each predefined interval are created. When a user clicks one of these buttons, the setChartInterval function is called with the chosen interval, swapping the currently displayed data series with the one corresponding to the chosen interval. Consequently, the viewers can quickly switch between different timeframes, providing flexible analysis of the data trends.


How to use the code sample
Show all code

const dayData = [
    { time: '2018-10-19', value: 26.19 },
];

const weekData = [
    { time: '2016-07-18', value: 26.1 },
];

const monthData = [
    { time: '2006-12-01', value: 25.4 },
];

const yearData = [
    { time: '2006-01-02', value: 24.89 },
];

const seriesesData = new Map([
    ['1D', dayData],
    ['1W', weekData],
    ['1M', monthData],
    ['1Y', yearData],
]);

const container = document.getElementById('container');
const chart = createChart(container, chartOptions);


const intervalColors = {
    '1D': '#2962FF',
    '1W': 'rgb(225, 87, 90)',
    '1M': 'rgb(242, 142, 44)',
    '1Y': 'rgb(164, 89, 209)',
};

const lineSeries = chart.addSeries(LineSeries, { color: intervalColors['1D'] });

function setChartInterval(interval) {
    lineSeries.setData(seriesesData.get(interval));
    lineSeries.applyOptions({
        color: intervalColors[interval],
    });
    chart.timeScale().fitContent();
}

setChartInterval('1D');

const intervals = ['1D', '1W', '1M', '1Y'];
intervals.forEach(interval => {
    const button = document.createElement('button');
    button.innerText = interval;
    button.addEventListener('click', () => setChartInterval(interval));
    buttonsContainer.appendChild(button);
});

container.appendChild(buttonsContainer);


