function cleanData(data) {
    //const parseYear = d3.timeParse("%Y");
	return data.map(d => ({
		...d,
        emission_lbs: +d.emission_lbs,
        emission_kg: +d.emission_kg,
        savings_lbs: +d.savings_lbs,
        savings_kg: +d.savings_kg,
        new_emission_kg: (+d.emission_kg) - (+d.savings_kg)
	}));
}

export default {cleanData};
