define( ['./svgFileArray'], function () {
	'use strict';
	
	// *****************************************************************************
	// Dimensions & Measures
	// *****************************************************************************	
	const dimensions = {
		uses: "dimensions",
		min: 0,
		max: 0,
	};
	const measures = {
		uses: "measures",
		min: 2,
		max: 2,
	};
	const sorting = {
		uses: "sorting"
	};

	const KPIMessage = {
		label: "KPI Message",
		type: "items",
		items: {		
			MyStringProp: {
				ref: "props.KPIMessage",
				label: "KPI Message",
				type: "string",
				defaultValue: '<p class="inactive"><span class="active">New Driver</span> accident rate is <span class="active">31%</span> in the first two years</p>',
				expression: "optional"
			},
			fontSize:{
				label: "Font Size",
				component: "slider",
				type:"number",
				ref: "props.fontSize",
				defaultValue: 1.5,
				min: 0.5,
				max: 3,
				step: 0.1
			},
			helpText: {
				label: "KPI message is a string with <p> tags, class 'inactive' within", 
				type: "string",
				component: "text"
			},	
			helpText1: {
				label: "Use <span> class 'active' to highlight the text as required", 
				type: "string",
				component: "text"
			},	
			helpText2: {
				label: "$() Dollar expansion can be inserted to calculate Qlik Expressions", 
				type: "string",
				component: "text"
			},
			helpText3: {
				label: "Further Styling can be done in the CSS file available via the DevHub", 
				type: "string",
				component: "text"
			}
		}
	}


	const propIcon = {
		label: "Icon",
		type: "items",
		grouped: true,
		items: {
			groupA:{
				type: "items",	
				items: {
					activeSVGFile: {
						label: "Active SVG",
						component: "dropdown",
						type: "string",
						ref: "props.ActiveSVG",
						options: svgFileArray
					},
					activeSVGColor: {
						//label: "Active Color",
						component: "color-picker",
						type: "object",
						ref: "props.ActiveSVGColor",
						defaultValue: {color: "#ff5866",index:"-1"}				
					}
				}
			},
			groupB:{
				type: "items",
				items:{
					groupText: {
						label: "Inactive SVG",
						type: "string",
						component: "text"
					},	
					inActiveSVGColor: {
						//label: "Inactive Color",
						component: "color-picker",
						type: "object",
						ref: "props.InactiveSVGColor",
						defaultValue: {color: "#ff5866",index:"-1"}					
					},
					inactiveSVGIconPropsShow:{			
						// label: "Inactive SVG",
						ref:"props.inactiveSVGIconCustom",
						component:"radiobuttons",
						type: "string",
						options: [{value: "false",label:"Reuse Active SVG"},{value: "true",label:"Choose Custom SVG"}],
						defaultValue: "false"	
					},
					inActiveSVGFile: { 
						show: function (e) {
							if (e.props.inactiveSVGIconCustom === "true") { return true;}
							return false
						},
						component: "dropdown",
						type: "string",
						ref: "props.InactiveSVG",
						options: svgFileArray
					}
				} 
			},

			groupC: {
				type:"items",
				items:{
					groupHeader: {
						label: "SVG Properties",
						component: "text"
					},
					iconSize:{
						label: "Size",
						component: "slider",
						type:"number",
						ref: "props.svgIconSize",
						defaultValue: 23,
						min: 10,
						max: 50,
						step: 1
					},
					iconMargin:{
						label: "Margin",
						component: "slider",
						type:"number",
						ref: "props.svgIconMargin",
						defaultValue: 2,
						min: 0,
						max: 10,
						step: 1
					},
					iconInlineRandom:{			
						label: "Distribution",
						ref:"props.iconInlineRandom",
						component:"radiobuttons",
						type: "string",
						options: [{value: "inline",label:"Inline"},{value: "random",label:"Random"}],
						defaultValue: "inline"	
					},
					iconMax:{
						label: "Maximum Number of Icons",
						type:"integer",
						ref: "props.svgIconMaxNumber",
						defaultValue: 100,
						min: 10,
						max: 200,
						step: 1
					}
				}
			}
		},
	}

	// Appearance section
	const appearanceSection = {
		uses: "settings",
		items: {
			propIcon: propIcon	
		}
	};



	// *****************************************************************************
	// Further sections
	// *****************************************************************************

	const helpText = {
		label: "Help",
		type: "items",
		items: {
			text: {
				label: "Two measures are required:",
				component: "text",
				type: "string"
			},
			text1: {
				label: "1. Numerator (Active)",
				component: "text",
				type: "string"
			},
			text2: {
				label: "2.Denominator (Remainder are Inactive)",
				component: "text",
				type: "string"
			},
			text3: {
				label: "More details can be found in 'readme.md' file.",
				component: "text",
				type: "string"
			}
		}
	}

	const aboutText = {
		label: "About",
		type: "items",
		items: {
			chartText: {
				label: "KPI SVG Grid Chart v1.0.0",
				component: "text",
				type: "string"
			},
			authorText: {
				label: "Richard Pearce",
				component: "text",
				type: "string"
			},
			debug :{
				label: "Debug",
				ref:"props.debug",
				component:"switch",
				type: "boolean",
				defaultValue: false,
				options: [{
					value: true,
					label: "Debug"
				},{
					value: false,
					label: "No Logging"
				}]
			}
		}
	}

	
	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: dimensions,
			measures: measures,
			KPIMessage: KPIMessage,
			sorting: sorting,
			appearanceSection: appearanceSection,
			aboutText: aboutText,
			helpText: helpText
		}
	};
});

