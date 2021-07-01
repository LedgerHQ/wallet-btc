/// <reference types="node" />
import events from 'events';
export default class EventEmitter extends events.EventEmitter {
    emit(event: string | symbol, ...data: any[]): boolean;
}
