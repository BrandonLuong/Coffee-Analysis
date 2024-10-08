function finalProj(){
    var filePath="final_coffee.csv";
    question0(filePath);
    plot1(filePath);
    plot2(filePath);
    plot3(filePath);
    plot4(filePath);
    plot5(filePath);
}

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data)
    });
}

var plot1=function(filePath){
    d3.csv(filePath).then(function(data){
        let width = 800;
		let height = 600;
        let padding = 100
        let x_padded = height-padding + 10;
        let y_padded = padding - 10
        // var coffee = data;
        // create canvas
        // const zoom = d3.zoom()
        // .on("zoom", (e)=>getComputedStyle.attr('transform', e.transform));
        let svg = d3.select("#scatter_plot").append("svg")
			.attr("width", width)
			.attr("height", height)
            .call(d3.zoom().on("zoom", function () {
                svg.attr("transform", d3.zoomTransform(this))
              }))

        // d3.select('svg').call(zoom);
    

        // define x and y scales 
        let xScale = d3.scaleLinear().domain([d3.min(data, function(d){return parseFloat(d["rating"])}), d3.max(data, function(d){return parseFloat(d["rating"])})]).range([padding, width-padding]);
        let yScale = d3.scaleLinear().domain([0, d3.max(data, function(d){return parseFloat(d["price"])})]).range([height-padding, padding]);
        // x and y axis
        svg.append('g').attr("transform", "translate(0," + x_padded + ")").
        call(d3.axisBottom(xScale));
        svg.append('g').attr("transform", "translate(" + y_padded + ",0)").call(d3.axisLeft(yScale));

        // axis and titles
        svg.append("text")
            .attr("transform", "translate(" + (width/2) + " ," + (height - 40) + ")")
            .style("text-anchor", "middle")
            .text("Rating");
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height/2))
            .attr("y", 40)
            .style("text-anchor", "middle")
            .text("Price");
        svg.append("text")
            .attr("x", width/2)
            .attr("y", padding)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Rating vs Price For Each Roast");
        // get unique roasts
        var roastList = [...new Set(data.map(item => item.roast))];

        // color scaling
        var colors = ['red', 'blue', 'green', 'purple', 'orange']
        let scale_ord = d3.scaleOrdinal().domain(roastList).range(colors);

        // create plot
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {return (xScale((d.rating)));})
            .attr("cy", function (d) {return (yScale((d.price)));})
            .attr("r", 2)
            .style("fill", d=>scale_ord(d["roast"]))

        // legend
        svg.selectAll("mydots")
            .data(roastList)
            .enter()
            .append("circle")
                .attr("cx", 150)
                .attr("cy", function(d,i){ return  150 + (i*20)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 7)
                .style("fill", function(d){ return scale_ord(d)})
        svg.selectAll("mylabels")
            .data(roastList)
            .enter()
            .append("text")
                .attr("x", 175)
                .attr("y", function(d,i){ return 150 + (i*20)}) // 100 is where the first dot appears. 25 is the distance between dots
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
        document.getElementById('analysis1').innerHTML = "As we can see from the scatter plot, there is not too much of a correlation between the price of a coffee and its rating. However, we do see that there are some instances of Medium-Light roast coffees with a higher rating and price. So maybe Medium-Light roasts of coffee dominate the popularity of coffee drinkers and possibly the coffee market. This may suggest that there may be another variable that contributes to a coffee's quality.";
    });
}

var plot2=function(filePath){
    d3.csv(filePath).then(function(data){
        var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 780 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

        let padding = 100;
        let x_padded = (height-padding + 10); 
        let y_padded = padding - 10

        // avg price per roast
        var coffee_roasts = (d3.rollup(data, v=>d3.mean(v, d=>d.price), d=>d.roast));
        var roastList = [...new Set(data.map(item => item.roast))];
        console.log(coffee_roasts)
        // avg price per country
        var total_country_price = d3.flatRollup(data, v=>d3.mean(v, d=>d.price), d=>d.loc_country)
        total_country_price.sort(function(a,b) {return b[1]-a[1]})
        var topTwentyFive = total_country_price.filter(function(d,i){return i<25})
        var topTwentyFiveList = [...new Set(topTwentyFive.map(item => item[0]))];
        var filterCountry = data.filter(function(d) {return (topTwentyFiveList.includes(d.loc_country))})
        console.log('avg roaster', total_country_price)
        console.log('top 25', topTwentyFive)
        console.log('filterRoasters', filterCountry)
        var countryRollup = d3.rollup(filterCountry, v=>d3.mean(v, d=>d.price), d=>d.loc_country, d=>d.roast)
        console.log(countryRollup)

        var foo = Object.fromEntries(countryRollup)
        console.log('foo', foo)
        for (let i of Object.keys(foo)){
            // console.log(foo[i].entries())
            if (!foo[i].has('Light')) {
                foo[i].set('Light', 0)
            }
            if (!foo[i].has('Medium-Light')) {
                foo[i].set('Medium-Light', 0)
            }
            if (!foo[i].has('Medium')) {
                foo[i].set('Medium', 0)
            }
            if (!foo[i].has('Medium-Dark')) {
                foo[i].set('Medium-Dark', 0)
            }
            if (!foo[i].has('Dark')) {
                foo[i].set('Dark', 0)
            }
        }
        var final = new Map(Object.entries(foo))
        var finalAll = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                maxAvg: d3.max(groups, function(d) { return (d[1])}),
                Light: groups.get('Light'),
                "Medium": groups.get('Medium'),
                "Medium-Light": groups.get('Medium-Light'),
                "Medium-Dark": groups.get('Medium-Dark'),
                Dark: groups.get('Dark'),
            }; 
        });
        ///////////////
        var lightObj = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                avg: groups.get('Light'),
            };});
        
        var mediumObj = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                avg: groups.get('Medium')};});
        var mediumLightObj = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                avg: groups.get('Medium-Light')};});
        var mediumDarkObj = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                avg: groups.get('Medium-Dark')};});
        var darkObj = Array.from(final, ([loc_country, groups]) => {
            return {
                country:loc_country,
                avg: groups.get('Dark')};});
        ////////////////

        // console.log('finalAll', finalAll)
        var final2 = {"Light": lightObj, 'Medium': mediumObj, "Medium-Light": mediumLightObj, "Medium-Dark":mediumDarkObj, "Dark":darkObj}
        final2["Light"].sort((a,b)=>b.avg > a.avg ? 1 : -1)
        final2["Medium"].sort((a,b)=>b.avg > a.avg ? 1 : -1)
        final2["Medium-Light"].sort((a,b)=>b.avg > a.avg ? 1 : -1)
        final2["Medium-Dark"].sort((a,b)=>b.avg > a.avg ? 1 : -1)
        final2["Dark"].sort((a,b)=>b.avg > a.avg ? 1 : -1)

        // console.log('final2',final2)
        // create canvas
        let svg = d3.select("#bar_chart").append("svg")
                .attr("width", width +100)
                .attr("height", height + 100)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
        
        var roastList = [...new Set(data.map(item => item.roast))];          
        var countryList = [...new Set(data.map(item => item.loc_country))];
        current = 'Light'
        // define x and y scales 
        let yScale = d3.scaleBand().domain(final2[current].map(function(d) { return d.country; })).range([10, height]).padding(0.1);
        console.log('idkidkidk', final2['Medium'].map(function(d) { return d.country; }))
        let xScale = d3.scaleLinear().domain([0, d3.max(finalAll, function(d) {return (d["maxAvg"])})]).range([0, width]);
        // x and y axis
        svg.append("g")
            .attr("transform", "translate(50," + (height+10) + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
        svg.append("g")
            .attr('id', 'y_axis')
            .attr("transform", "translate(" + 50 + ",10)")
            .call(d3.axisLeft(yScale))
        // axis and titles
        svg.append("text")
            .attr("transform", "translate(" + (width/2) + " ," + (height + 40) + ")")
            .style("text-anchor", "middle")
            .text("Average Price");
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height/2))
            .attr("y", -35)
            .style("text-anchor", "middle")
            .text("Country");
        svg.append("text")
            .attr("x", width/2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Average Price For Each Roast Per Country");
    
        // create rect
        svg.selectAll(".a1bar")
            .data(final2[current])
            .enter()
            .append("rect")
            .attr("x", xScale(0) + 50)
            .attr("y", function(d) { return yScale(d.country) + 10; })
            .attr("width", function(d) { return xScale(d.avg); })
            .attr("height", yScale.bandwidth() )
            .attr("fill", "blue")


        var radio = d3.select('#radio_bar')
            .attr('name', 'value').on("change", function (d) {
                current_roast = d.target.value; //getting the value of selected radio button
                
                c_data = final2[current_roast]; //filtering for current year

                let yScale = d3.scaleBand().domain(final2[current_roast].map(function(d) { return d.country; })).range([10, height]).padding(0.1);
                y_axis = d3.axisLeft(yScale)
                svg.select("#y_axis")
                    .transition()
                    .call(y_axis)

                let xScale = d3.scaleLinear().domain([0, d3.max(finalAll, function(d) {return (d["maxAvg"])})]).range([0, width]);
                // y axis
                var x_axis = d3.axisBottom(xScale)
                
                // console.log(c_data.map(d=>d.val))
                d3.selectAll("g.x_axis")
                    .transition()
                    .call(x_axis)

                d3.selectAll("rect")
                .data(final2[current_roast])
                    .transition().duration(1000)
                    .attr("width", function(d) {return (xScale(d['avg'])); })
                    .attr("height", yScale.bandwidth() )
                    .attr("y", function(d) { return yScale(d.country) + 10; })
                    .attr("x", xScale(0) + 50)
            })
    });
    document.getElementById('analysis2').innerHTML = "Here, we can see from the data that not all of the countries process each roast of coffee. However, it can be observed that Hawaii and some of the Asian countries generally remain at the top regarding the average price for each roast. What this visualization may suggest is that these companies may use certain techniques not used by other countries to produce higher quality coffee. We can also see that the light and medium-light roasts have higher average prices than the medium, medium-dark, and dark roasts. This also suggests that light and medium-light roast coffee are more popular, and perhaps are generally higher quality";
}

var plot3=function(filePath){
    d3.csv(filePath).then(function(data){
        var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 1280 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

        let padding = 100;
        let x_padded = (height-padding + 0);
        let y_padded = padding - 0;

        var svg = d3.select("#stacked_bar_chart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform",
                            "translate(" + 100 + "," + margin.top + ")");

        // get unique roasts
        var roastList = [...new Set(data.map(item => item.roast))];

        // color scaling
        var colors = ['red', 'blue', 'green', 'purple', 'orange']
        let scale_ord = d3.scaleOrdinal().domain(roastList).range(colors);

        // want top 10 origins that produces the most beans
        var coffee = (d3.rollup(data, v=>v.length, d=>d.origin_1, d=>d.roast));

        var foo = Object.fromEntries(coffee)
        for (let i of Object.keys(foo)){
            // console.log(foo[i].entries())
            if (!foo[i].has('Light')) {
                foo[i].set('Light', 0)
            }
            if (!foo[i].has('Medium-Light')) {
                foo[i].set('Medium-Light', 0)
            }
            if (!foo[i].has('Medium')) {
                foo[i].set('Medium', 0)
            }
            if (!foo[i].has('Medium-Dark')) {
                foo[i].set('Medium-Dark', 0)
            }
            if (!foo[i].has('Dark')) {
                foo[i].set('Dark', 0)
            }
        }
        var final = new Map(Object.entries(foo))
        var filtered_agg = Array.from(final, ([origin_1, groups]) => {
            return {
                origin:origin_1,
                beans_produced: groups.get('Light') + groups.get('Medium') + groups.get('Medium-Light') + groups.get('Medium-Dark') + groups.get('Dark'), 
                Light: groups.get('Light'),
                "Medium": groups.get('Medium'),
                "Medium-Light": groups.get('Medium-Light'),
                "Medium-Dark": groups.get('Medium-Dark'),
                Dark: groups.get('Dark'),
            }; 
        });
        // sort origins by number of beans produced
        filtered_agg.sort(function(a,b) {return b.beans_produced-a.beans_produced})
        var topTen = filtered_agg.filter(function(d,i){return i<10})
        var originList = [...new Set(topTen.map(item => item.origin))];

        // set x and y scales
        var xScale = d3.scaleBand().domain(originList).range([padding, width-padding]).paddingInner(0.1).paddingOuter(0.1);

        svg.append('g').attr('transform', "translate(0," + x_padded + ")").call(d3.axisBottom(xScale))

        var yScale = d3.scaleLinear().domain([0, d3.max(topTen, function(d){return parseFloat(d["beans_produced"])})]).range([height-padding, padding]);
        svg.append('g').attr("transform", "translate(" + y_padded + ",0)").call(d3.axisLeft(yScale));
        var topTen2 = topTen.map(d=>({origin:d.origin, Light:d['Light'], Medium:d['Medium'], "Medium-Light":d['Medium-Light'], "Medium-Dark":d['Medium-Dark'], Dark:d['Dark']}))
        console.log('topTen2',topTen2)
        var stackedData = d3.stack().keys(roastList)(topTen2)

        var tooltip = d3.select("#stacked_bar_chart")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip")
                        .style("position", "absolute")
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "1px")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
                     
        var mouseover = function(d) {
                tooltip.transition().duration(50).style("opacity", 1);
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 0.9)}
        var mousemove = function(e, d) {
            tooltip
                .style('display', 'inline-block')
                .html(Object.keys(d.data).find(k=>d.data[k]===d[1]-d[0]) + ": " +( d[1]-d[0]));
            tooltip
                .style("left", (e.pageX +10) + "px")
                .style("top", (e.pageY - 10) + "px");}

        var mouseleave = function(d) {tooltip.style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)}
                
        // axis and titles
        svg.append("text")
            .attr("transform", "translate(" + (width/2) + " ," + (height - 40) + ")")
            .style("text-anchor", "middle")
            .text("Origin");
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height/2))
            .attr("y", 40)
            .style("text-anchor", "middle")
            .text("Number Produced");
        svg.append("text")
            .attr("x", width/2)
            .attr("y", padding)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Number of Beans Produced For The Top Ten Origins Per Roast");
        
        // legend
        svg.selectAll("mydots")
            .data(roastList)
            .enter()
            .append("circle")
                .attr("cx", 600)
                .attr("cy", function(d,i){ return  150 + i*20}) 
                .attr("r", 5)
                .style("fill", function(d){ return scale_ord(d)})
        svg.selectAll("mylabels")
            .data(roastList)
            .enter()
            .append("text")
                .attr("x", 620)
                .attr("y", function(d,i){ return 150 + i*20}) 
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
    

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return (scale_ord(d.key));})
            .selectAll("rect")
            .data(function(d) { return (d);})
            .enter().append("rect")
                .attr("x", function(d) { return (xScale(d.data.origin)); })
                .attr("y", function(d) {  return yScale((d[1])); })
                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                .attr("width", (xScale.bandwidth()))
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
            
    });
    document.getElementById('analysis3').innerHTML = "In this visualization, we can see a clear trend. For the top ten producers, each origin mostly produces medium-light beans followed by medium and light roasted beans, then medium-dark, and lastly no dark roasts are produced. By looking at this and previous data, we can see that medium-light roasted coffee has been the most popular type of coffee among the data. We can also say that these origins produce high quality medium-light coffee as seen through the prices and ratings."
}

var plot4=function(filePath){
    d3.csv(filePath).then(function(data){
        // find the countries that process the most coffee
        // which countries process the most coffee?
        var width = 1000;
        var height = 700;

        // var grouped_country = d3.rollup(data, v=>v.length, d=>d.loc_country)
        var grouped_country = d3.group(data, d=>d.loc_country)
        var grouped_country = Array.from(grouped_country, ([loc_country, groups]) => {
            return {
                country:loc_country, 
                total: d3.count(groups, d=>1)
            };
        });

        var colorScale = d3.scaleThreshold()
                            .domain([0, 5, 10, 50, 100])
                            .range(d3.schemeBlues[5]);


        var svg = d3.select("#geometric")
            .append("svg").attr("width", width)
            .attr("height", height);

        var projection2 = d3.geoNaturalEarth1()
                        .scale(width / 1.3 / Math.PI)
                        .translate([width / 2, (height /2) +25])

        var country_rollup = d3.rollup(data, v=>v.length, d=>d.loc_country)

        const worldmap = d3.json("countries.geojson");
        worldmap.then(function(map) {
            // console.log()
            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(map.features)
                .enter().append("path")
                .attr("fill", "#69b3a2")

                    .attr("d", d3.geoPath()
                        .projection(projection2)
                    )
                    .style("stroke", "#fff")
                    .attr('fill', function(d){d.total = country_rollup.get(d.properties.ADMIN) || 0;   return (colorScale((d.total)))})
        });
        // title
        var padding = 100;
        svg.append("text")
                .attr("x", width/2)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .text("Profit and Sales For Furniture Per State");
        // legend
        var legendPadding = 150
         // legend
         svg.selectAll("mydots")
         .data([0, 5, 10, 50, 100])
         .enter()
         .append("circle")
             .attr("cx", 10)
             .attr("cy", function(d,i){ return 400 + i*25}) 
             .attr("r", 7)
             .style("fill", function(d){ return colorScale(d)})
        svg.selectAll("mylabels")
             .data(["0-5", "5-10", "10-50", "50-100", "100-"])
             .enter()
             .append("text")
                 .attr("x", 20)
                 .attr("y", function(d,i){ return 400 + i*25}) 
                 .text(function(d, i){return d})
                 .attr("text-anchor", "left")
                 .style("alignment-baseline", "middle")
    });
    document.getElementById('analysis4').innerHTML = "By looking at the map, we can see that the North American countries, Canada and The United States, contain the greatest amount of coffee roasters. This may say something about the quality of coffee beans that are processed in these countries especially The United States. We saw in a previous visualization that Hawaii consistently remained at the top of the list in terms of average coffee price, suggesting that the coffee processed there is of high quality.";
}

var plot5=function(filePath){
    d3.csv(filePath).then(function(data){
        // what kind of relationship do the top ten origins with the highest number of beans produced have with each other?
        var margin = {top: 30, right: 30, bottom: 30, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#adjacency")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right + 100)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                            "translate(" + 150 + "," + margin.top + ")");


        var coffee = (d3.rollup(data, v=>v.length, d=>d.origin_1, d=>d.roast));
        var foo = Object.fromEntries(coffee)
        var foo2 = new Map(Object.entries(foo))
        for (let i of Object.keys(foo)){
            // console.log(foo[i].entries())
            if (!foo[i].has('Light')) {
                foo[i].set('Light', 0)
            }
            if (!foo[i].has('Medium-Light')) {
                foo[i].set('Medium-Light', 0)
            }
            if (!foo[i].has('Medium')) {
                foo[i].set('Medium', 0)
            }
            if (!foo[i].has('Medium-Dark')) {
                foo[i].set('Medium-Dark', 0)
            }
            if (!foo[i].has('Dark')) {
                foo[i].set('Dark', 0)
            }
        }
        var filtered_agg = Array.from(foo2, ([origin_1, groups]) => {
            return {
                origin:origin_1,
                beans_produced: groups.get('Light') + groups.get('Medium') + groups.get('Medium-Light') + groups.get('Medium-Dark') + groups.get('Dark')
            }; 
        });
        // // sort origins by number of beans produced
        filtered_agg.sort(function(a,b) {return b.beans_produced-a.beans_produced});
        var topTen = filtered_agg.filter(function(d,i){return i<10});
        var originList = [...new Set(topTen.map(item => item.origin))];
        var final_filtered = data.filter(function(d) {return originList.includes(d.origin_1) && originList.includes(d.origin_2)} )
        var rollupCountry = d3.flatRollup(data, v=>v.length, d=>d.origin_1, d=>d.origin_2)
        rollupCountry.sort(function(a,b) {return b[2]-a[2]});
        var filteredTopTen = rollupCountry.filter(function(d) {return (originList.includes(d[1]) && originList.includes(d[0]))})
        var foo3 = d3.group(final_filtered, d=>d.origin_1, d=>d.origin_2)

        // set axis
        var x = d3.scaleBand()
                    .range([ 0, width ])
                    .domain(originList)
        svg.append("g")
            .attr("transform", "translate(0," + height  + ")")
            .call(d3.axisBottom(x))
        svg.append("text")
            .attr("transform", "translate(" + (width/2) + " ," + (height +30) + ")")
            .style("text-anchor", "middle")
            .text("Origin");

        var y = d3.scaleBand()
            .range([ 0, width ])
            .domain(originList)
        svg.append("g")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height/2))
            .attr("y", -100)
            .style("text-anchor", "middle")
            .text("Origin");

        // color scale
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolatePuRd)
            .domain([d3.min(filteredTopTen, function(array) {
                return (array[2]);}), d3.max(filteredTopTen, function(array) {
                return (array[2]);})])

        // creat heatmap
        svg.selectAll()
            .data(filteredTopTen, function(d) {return d[0]+':'+d[1];})
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d[0]) })
            .attr("y", function(d) { return y(d[1]) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d[2])} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)

        svg.append("text")
            .attr("x", width/2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text("Number of Blends for Each Origin");

    });
    document.getElementById('analysis5').innerHTML = "In this visualization, we can clearly see that the regions Colombia and Ethiopa both produce the greatest amount of the same coffee, followed by Brazil and Colombia. What this suggests is that these Regions may produce high quality coffee and maybe the countries like the United States that contain the most processors import the coffee from Regions such as Ethiopia, Colombia, and Brazil."
}