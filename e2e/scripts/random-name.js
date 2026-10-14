// Maestro runScript (GraalJS). Writes "<PREFIX> <4 digits>" to output[KEY] so typed names stay unique.
output[KEY] = PREFIX + " " + (1000 + Math.floor(Math.random() * 9000));
