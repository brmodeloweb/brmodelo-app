import { shapes } from '@joint/core';
import link from './link';
import erd from './shapes';
import uml from './table';
import logic from './logic';
import note from './notes';
import nosql from './nosql';

const namespace = {
	...shapes,
	link,
	erd,
	uml,
	logic,
	custom: note,
	nosql,
};

export default namespace;
