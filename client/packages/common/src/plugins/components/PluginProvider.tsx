import {
  ColumnPlugin,
  ComponentPlugin,
  create,
  ArrayUtils,
  EventType,
  ComponentPluginType,
} from '@openmsupply-client/common';

type PluginEventListener = {
  eventType: EventType;
  listener: EventListener;
  pluginType: ComponentPluginType;
};

type PluginProvider = {
  addColumnPlugin: (plugin: ColumnPlugin) => void;
  addComponentPlugin: (plugin: ComponentPlugin) => void;
  addEventListener: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    listener: EventListener
  ) => void;
  columnPlugins: ColumnPlugin[];
  componentPlugins: ComponentPlugin[];
  dispatchEvent: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    event: Event
  ) => void;
  eventListeners: PluginEventListener[];
  getComponentPlugins: <T extends ComponentPlugin['type']>(
    type: T
  ) => Extract<ComponentPlugin, { type: T }>[];
  getColumnPlugins: <T extends ColumnPlugin['type']>(
    type: T
  ) => Extract<ColumnPlugin, { type: T }>[];
  removeEventListener: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    listener: EventListener
  ) => void;
};

export const usePluginProvider = create<PluginProvider>((set, get) => ({
  columnPlugins: [],
  componentPlugins: [],
  eventListeners: [],
  addColumnPlugin: (plugin: ColumnPlugin) =>
    set(({ columnPlugins }) => ({
      columnPlugins: ArrayUtils.uniqBy([...columnPlugins, plugin], 'module'),
    })),
  addComponentPlugin: (plugin: ComponentPlugin) =>
    set(({ componentPlugins }) => ({
      componentPlugins: ArrayUtils.uniqBy(
        [...componentPlugins, plugin],
        'module'
      ),
    })),
  addEventListener: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    listener: EventListener
  ) =>
    set(({ eventListeners }) => ({
      eventListeners: [...eventListeners, { eventType, pluginType, listener }],
    })),
  dispatchEvent: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    event: Event
  ) => {
    // console.debug(`*** dispatching event ${eventType} for ${pluginType} ***`);
    get()
      .eventListeners.filter(
        listener =>
          listener.pluginType === pluginType && listener.eventType === eventType
      )
      .forEach(listener => listener.listener(event));
  },
  getColumnPlugins: <T extends ColumnPlugin['type']>(type: T) => {
    const columnPlugins = get().columnPlugins;
    return columnPlugins.filter(
      (plugin): plugin is Extract<ColumnPlugin, { type: T }> =>
        plugin.type === type
    );
  },
  getComponentPlugins: <T extends ComponentPlugin['type']>(type: T) => {
    const plugins = get().componentPlugins;
    return plugins.filter(
      (plugin): plugin is Extract<ComponentPlugin, { type: T }> =>
        plugin.type === type
    );
  },
  removeEventListener: (
    eventType: EventType,
    pluginType: ComponentPluginType,
    listener: EventListener
  ) =>
    set(({ eventListeners }) => ({
      eventListeners: eventListeners.filter(
        l =>
          l.eventType !== eventType ||
          l.pluginType !== pluginType ||
          l.listener !== listener
      ),
    })),
}));
