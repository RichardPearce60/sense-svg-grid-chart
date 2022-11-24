
define( [ 		
		'./js/properties',
		'./js/d3.min',
		'./js/lodash'
	],
	function ( props 
				,d3
				,_	
			) {
		
		'use strict';
			
		return {
			definition: props,
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [
						{
							qWidth: 10,
							qHeight: 10
						}
					]
				}
			},
			paint: function ( $element, layout ) {}, 		
				resize: function ($element, layout,scope){ 
					if(layout.props.debug) {console.log("Resize <<<<<<<<<")}
					try {
						this.$scope.init($element, layout); 
						this.$scope.render(this.$scope.element, layout);
					} catch(err){console.log(err)}
				},

				controller: ['$scope','$element',function (scope , $element) {
					
					scope.prep = function(scope, $element, layout) { 
						if(layout.props.debug) {console.log("Scope PREP & INIT <<<<<<<<<")}
							// Store URL and Load CSS
    						scope.baseUrl = window.location.pathname.substring(0 , window.location.pathname.toLowerCase().indexOf("/sense")+1);
    						scope.extensionUrl = scope.baseUrl + 'Extensions/' + layout.visualization + '/' ; 

    						$.get(scope.baseUrl + (scope.baseUrl.slice(-1) === "/" ? "" : "/") + "Extensions/sense-svg-grid-chart/main.css", function(cssContent) {
        						$( "<style>" ).html( cssContent ).appendTo( "head" );
    						});

							// Prep
							scope.mainDiv = d3.select($element.children()[0]).append('div').attr("class","sense-svg-grid-chart main-background")
							scope.mainDiv.htmlDiv = scope.mainDiv.append('div').attr("id","html-container-ssgc").attr("class","notation").style("position","absolute")

							scope.mainDiv.svgDiv = scope.mainDiv.append('div').attr("class","svg-div").style("position","absolute")
							scope.mainDiv.iconDiv_svg = scope.mainDiv.svgDiv.append('svg').attr("width","100%").attr("height","100%")
							scope.mainDiv.iconDiv_svg.mainGroup = scope.mainDiv.iconDiv_svg.append('g').classed('main-svg',true)

							scope.init($element, layout)
					};

					scope.init = function($element, layout){
						if(layout.props.debug) {console.log("Scope INIT <<<<<<<<<")}

						scope.mainDiv.width = $element.width()
						scope.mainDiv.height = $element.height()

						// Reposition the standard elements
						d3.select('.main-background').style("height",scope.mainDiv.height + "px").style("width",scope.mainDiv.width + "px")
						scope.mainDiv.htmlDiv.style("height",scope.mainDiv.height + "px").style("width", scope.mainDiv.width / 2 + "px")
						scope.mainDiv.svgDiv.style("height",scope.mainDiv.height + "px").style("width", scope.mainDiv.width / 2 + "px").style("left", scope.mainDiv.width / 2 + "px") 
						
						scope.getData(scope.layout)
					};

					scope.getData = function(layout ) {	
						if(layout.props.debug) {console.log("Scope GET DATA <<<<<<<<<")}

						scope.activeFilterStyle = scope.hexToFilter(layout.props.ActiveSVGColor.color)
						scope.inactiveFilterStyle = scope.hexToFilter(layout.props.InactiveSVGColor.color)

						scope.gridProperties = scope.calculateGridProperties({
							width: scope.mainDiv.width/2,
							height: scope.mainDiv.height,
							icon_w_h: layout.props.svgIconSize,
							iconMargin: layout.props.svgIconMargin,
							maxIcons: layout.props.svgIconMaxNumber,
							numberator: layout.qHyperCube.qDataPages[0].qMatrix[0][0].qNum,
							denominator: layout.qHyperCube.qDataPages[0].qMatrix[0][1].qNum
						})
													
						scope.iconActiveIndex = scope.iconActiveIndexCalculate({
							activeIcons: scope.gridProperties.activeIcons,
							totalIcons: scope.gridProperties.totalIcons,
							orderType: layout.props.iconInlineRandom
						})
						
						scope.iconAttributesData = scope.iconAttributesCalculate(scope, layout, {
							columns: scope.gridProperties.columns,
							rows: scope.gridProperties.rows,
							iconsPerRow: scope.gridProperties.iconsPerRow,
							activeIcons: scope.gridProperties.activeIcons,
							totalIcons: scope.gridProperties.totalIcons,
							icon_w_h: layout.props.svgIconSize,
							iconMargin: layout.props.svgIconMargin
						})

					};
					
					scope.calculateGridProperties = function({width,height,icon_w_h,iconMargin,maxIcons,denominator,numberator}) {
						const iconTotal_w_h = icon_w_h + ( iconMargin * 2) 
						const columns = Math.floor(width / iconTotal_w_h); 
						const rows = Math.floor(height / iconTotal_w_h); 
						const capactity = rows * columns
						const totalIcons = Math.min(maxIcons, denominator, capactity )
						const percentage = numberator / denominator
						const iconsPerRow  = Math.floor(  Math.sqrt(totalIcons)<Math.min(columns,rows) ? Math.sqrt(totalIcons)  : totalIcons / rows) 
						const rowsActual = totalIcons / iconsPerRow
						const activeIcons  = Math.floor(totalIcons * percentage) 
						const inactiveIcons  = totalIcons - activeIcons

						const gridTransformX = (width - (iconTotal_w_h * iconsPerRow)) / 2  
						const gridTransformY = (height - (iconTotal_w_h * rowsActual)) / 2 // BUG Requires Fixing !!
					 
						const obj = {iconTotal_w_h, columns, rows, capactity, totalIcons, percentage, iconsPerRow, rowsActual, activeIcons, inactiveIcons,gridTransformX,gridTransformY}
						return obj
					};

					scope.iconActiveIndexCalculate = function({activeIcons, totalIcons, orderType}) {
						let arr=[];
						if(orderType==="random") {  
							let i = 0, current=0, findIndex=0;	  
							if(activeIcons) while(i < activeIcons) {
								current = Math.floor(Math.random() * (totalIcons + 1));         
								findIndex = _.findIndex(arr, function(o) { return o == current; });  
								if(findIndex<0) {
									arr.push(current)
									i++
								}
							} 
							arr.sort(function(a, b){return a - b});
						} else if (orderType==="inline") {
							arr = Array.from(Array(activeIcons).keys()) 
						}  
						  return arr  
					};

					scope.iconAttributesCalculate = function(scope,layout ,{columns, rows, iconsPerRow, activeIcons, totalIcons, icon_w_h, iconMargin}) {
						let array =[]
						for (let i = 0; i < totalIcons; i++) {
						  let id = i
						  let styleFilter = "", svgUrl = ""
						  let findIndex = _.findIndex(scope.iconActiveIndex, function(o) { return o == i; });
						  if(findIndex<0) {
							  styleFilter = scope.inactiveFilterStyle 
							  svgUrl = scope.extensionUrl +"svg/" + layout.props.InactiveSVG
						  } else {
							  styleFilter = scope.activeFilterStyle
							  svgUrl = scope.extensionUrl +"svg/" + layout.props.ActiveSVG 
						  }
						  
						  let x = (i % iconsPerRow) * icon_w_h  + ( iconMargin *  ((i % iconsPerRow)+1))
						  let y = Math.floor((i)/iconsPerRow) * icon_w_h +( iconMargin * (Math.floor(i/iconsPerRow)+1 ))	  
					  
						  let obj = {id,x,y,styleFilter,svgUrl}
						  array.push(obj)
						}
					  
						return array
					};

					scope.hexToFilter = function(hex){
						// hexToFiler code taken from https://codepen.io/sosuke/pen/Pjoqqp
						function hexToRgb(hex) {
							// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
							const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
							hex = hex.replace(shorthandRegex, (m, r, g, b) => {
							  return r + r + g + g + b + b;
							});
						  
							const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
							return result
							  ? [
								parseInt(result[1], 16),
								parseInt(result[2], 16),
								parseInt(result[3], 16),
							  ]
							  : null;
						} 
						class Color {
							constructor(r, g, b) {
								this.set(r, g, b);
							  }
							  
							  toString() {
								return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
							  }
							
							  set(r, g, b) {
								this.r = this.clamp(r);
								this.g = this.clamp(g);
								this.b = this.clamp(b);
							  }
							
							  hueRotate(angle = 0) {
								angle = angle / 180 * Math.PI;
								const sin = Math.sin(angle);
								const cos = Math.cos(angle);
							
								this.multiply([
								  0.213 + cos * 0.787 - sin * 0.213,
								  0.715 - cos * 0.715 - sin * 0.715,
								  0.072 - cos * 0.072 + sin * 0.928,
								  0.213 - cos * 0.213 + sin * 0.143,
								  0.715 + cos * 0.285 + sin * 0.140,
								  0.072 - cos * 0.072 - sin * 0.283,
								  0.213 - cos * 0.213 - sin * 0.787,
								  0.715 - cos * 0.715 + sin * 0.715,
								  0.072 + cos * 0.928 + sin * 0.072,
								]);
							  }
							
							  grayscale(value = 1) {
								this.multiply([
								  0.2126 + 0.7874 * (1 - value),
								  0.7152 - 0.7152 * (1 - value),
								  0.0722 - 0.0722 * (1 - value),
								  0.2126 - 0.2126 * (1 - value),
								  0.7152 + 0.2848 * (1 - value),
								  0.0722 - 0.0722 * (1 - value),
								  0.2126 - 0.2126 * (1 - value),
								  0.7152 - 0.7152 * (1 - value),
								  0.0722 + 0.9278 * (1 - value),
								]);
							  }
							
							  sepia(value = 1) {
								this.multiply([
								  0.393 + 0.607 * (1 - value),
								  0.769 - 0.769 * (1 - value),
								  0.189 - 0.189 * (1 - value),
								  0.349 - 0.349 * (1 - value),
								  0.686 + 0.314 * (1 - value),
								  0.168 - 0.168 * (1 - value),
								  0.272 - 0.272 * (1 - value),
								  0.534 - 0.534 * (1 - value),
								  0.131 + 0.869 * (1 - value),
								]);
							  }
							
							  saturate(value = 1) {
								this.multiply([
								  0.213 + 0.787 * value,
								  0.715 - 0.715 * value,
								  0.072 - 0.072 * value,
								  0.213 - 0.213 * value,
								  0.715 + 0.285 * value,
								  0.072 - 0.072 * value,
								  0.213 - 0.213 * value,
								  0.715 - 0.715 * value,
								  0.072 + 0.928 * value,
								]);
							  }
							
							  multiply(matrix) {
								const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
								const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
								const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
								this.r = newR;
								this.g = newG;
								this.b = newB;
							  }
							
							  brightness(value = 1) {
								this.linear(value);
							  }
							  contrast(value = 1) {
								this.linear(value, -(0.5 * value) + 0.5);
							  }
							
							  linear(slope = 1, intercept = 0) {
								this.r = this.clamp(this.r * slope + intercept * 255);
								this.g = this.clamp(this.g * slope + intercept * 255);
								this.b = this.clamp(this.b * slope + intercept * 255);
							  }
							
							  invert(value = 1) {
								this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
								this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
								this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
							  }
							
							  hsl() {
								// Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
								const r = this.r / 255;
								const g = this.g / 255;
								const b = this.b / 255;
								const max = Math.max(r, g, b);
								const min = Math.min(r, g, b);
								let h, s, l = (max + min) / 2;
							
								if (max === min) {
								  h = s = 0;
								} else {
								  const d = max - min;
								  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
								  switch (max) {
									case r:
									  h = (g - b) / d + (g < b ? 6 : 0);
									  break;
							
									case g:
									  h = (b - r) / d + 2;
									  break;
							
									case b:
									  h = (r - g) / d + 4;
									  break;
								  }
								  h /= 6;
								}
							
								return {
								  h: h * 100,
								  s: s * 100,
								  l: l * 100,
								};
							  }
							
							  clamp(value) {
								if (value > 255) {
								  value = 255;
								} else if (value < 0) {
								  value = 0;
								}
								return value;
							  }
						};
						class Colver {
							constructor(target, baseColor) {
								this.target = target;
								this.targetHSL = target.hsl();
								this.reusedColor = new Color(0, 0, 0);
							  }
							
							  solve() {
								const result = this.solveNarrow(this.solveWide());
								return {
								  values: result.values,
								  loss: result.loss,
								  filter: this.css(result.values),
								};
							  }
							
							  solveWide() {
								const A = 5;
								const c = 15;
								const a = [60, 180, 18000, 600, 1.2, 1.2];
							
								let best = { loss: Infinity };
								for (let i = 0; best.loss > 25 && i < 3; i++) {
								  const initial = [50, 20, 3750, 50, 100, 100];
								  const result = this.spsa(A, a, c, initial, 1000);
								  if (result.loss < best.loss) {
									best = result;
								  }
								}
								return best;
							  }
							
							  solveNarrow(wide) {
								const A = wide.loss;
								const c = 2;
								const A1 = A + 1;
								const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
								return this.spsa(A, a, c, wide.values, 500);
							  }
							
							  spsa(A, a, c, values, iters) {
								const alpha = 1;
								const gamma = 0.16666666666666666;
							
								let best = null;
								let bestLoss = Infinity;
								const deltas = new Array(6);
								const highArgs = new Array(6);
								const lowArgs = new Array(6);
							
								for (let k = 0; k < iters; k++) {
								  const ck = c / Math.pow(k + 1, gamma);
								  for (let i = 0; i < 6; i++) {
									deltas[i] = Math.random() > 0.5 ? 1 : -1;
									highArgs[i] = values[i] + ck * deltas[i];
									lowArgs[i] = values[i] - ck * deltas[i];
								  }
							
								  const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
								  for (let i = 0; i < 6; i++) {
									const g = lossDiff / (2 * ck) * deltas[i];
									const ak = a[i] / Math.pow(A + k + 1, alpha);
									values[i] = fix(values[i] - ak * g, i);
								  }
							
								  const loss = this.loss(values);
								  if (loss < bestLoss) {
									best = values.slice(0);
									bestLoss = loss;
								  }
								}
								return { values: best, loss: bestLoss };
							
								function fix(value, idx) {
								  let max = 100;
								  if (idx === 2 /* saturate */) {
									max = 7500;
								  } else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) {
									max = 200;
								  }
							
								  if (idx === 3 /* hue-rotate */) {
									if (value > max) {
									  value %= max;
									} else if (value < 0) {
									  value = max + value % max;
									}
								  } else if (value < 0) {
									value = 0;
								  } else if (value > max) {
									value = max;
								  }
								  return value;
								}
							  }
							
							  loss(filters) {
								// Argument is array of percentages.
								const color = this.reusedColor;
								color.set(0, 0, 0);
							
								color.invert(filters[0] / 100);
								color.sepia(filters[1] / 100);
								color.saturate(filters[2] / 100);
								color.hueRotate(filters[3] * 3.6);
								color.brightness(filters[4] / 100);
								color.contrast(filters[5] / 100);
							
								const colorHSL = color.hsl();
								return (
								  Math.abs(color.r - this.target.r) +
								  Math.abs(color.g - this.target.g) +
								  Math.abs(color.b - this.target.b) +
								  Math.abs(colorHSL.h - this.targetHSL.h) +
								  Math.abs(colorHSL.s - this.targetHSL.s) +
								  Math.abs(colorHSL.l - this.targetHSL.l)
								);
							  }
							
							  css(filters) {
								function fmt(idx, multiplier = 1) {
								  return Math.round(filters[idx] * multiplier);
								}
								return `invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%)`;
							  }
						};

						const rgb = hexToRgb(hex);
						if (rgb.length !== 3) {
							console.log("Invalid Color")
							return;
						}
					  
						const color = new Color(rgb[0], rgb[1], rgb[2]);
						const solver = new Colver(color);
						const result = solver.solve();
						
						return result.filter
					};

					scope.render = function( element, layout) { 
						if(layout.props.debug) {console.log("Scope RENDER <<<<<<<<<")}

						const r = document.querySelector(':root'); // Update CSS variables to props
						r.style.setProperty('--activeNotation', layout.props.ActiveSVGColor.color);
						r.style.setProperty('--inactiveNotation', layout.props.InactiveSVGColor.color);
						r.style.setProperty('--notationFontSize', layout.props.fontSize +"em");	

						document.getElementById('html-container-ssgc').innerHTML = layout.props.KPIMessage;

						// Position Group Center; Y transform BUG Needs Fixing...
						scope.mainDiv.iconDiv_svg.mainGroup.attr('transform',`translate(${scope.gridProperties.gridTransformX},${scope.gridProperties.gridTransformY})`)

						const iconGroup = scope.mainDiv.iconDiv_svg.mainGroup.selectAll('g')
						.data(scope.iconAttributesData, function(d) {return d.id})
						.join(
							(enter) =>{
							   let entered = enter.append('g')
												  	.classed('icon', true)
												  	.attr('transform',(d) => `translate(${d.x},${d.y})`)

								entered.append("svg:image")
													.attr("xlink:href", (d) =>{return d.svgUrl}) 
													.attr("width", layout.props.svgIconSize)
													.attr("height", layout.props.svgIconSize)
													.style("filter",(d) => {return d.styleFilter})
							   return entered
							}
							,(update) =>{
								let updated = update.attr('transform',(d) => `translate(${d.x},${d.y})`)
													.select('image')
														.attr("xlink:href", (d) =>{return d.svgUrl}) 
														.attr("width", layout.props.svgIconSize)
														.attr("height", layout.props.svgIconSize)
														.style("filter",(d) => {return d.styleFilter})
							   return updated
							}
						)
					};
					//console.log('## Extension Run ##') 
					scope.prep(scope, $element, scope.layout);
					scope.render(scope.element, scope.layout)

					scope.backendApi.model.Validated.bind(function(a,b){
						// listens for DOM events or new data. ------------------------------------------------------------------
						if(scope.layout.props.debug) { console.log("Scope NEW DATA <<<<<<<<<")}
						
						try {
							scope.getData(scope.layout);
							scope.render(scope.element, scope.layout);
						} catch(err){
							console.log(err)
						}
					})
				}]					
		};		
	} 
);
