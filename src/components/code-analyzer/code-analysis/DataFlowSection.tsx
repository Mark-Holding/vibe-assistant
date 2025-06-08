import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, Zap, Filter, BarChart3, Network, Search } from 'lucide-react';
import { DataFlowInfo } from '../../../types/code-analysis';
import { Tooltip } from '../../ui/Tooltip';

interface DataFlowSectionProps {
  dataFlow: DataFlowInfo[];
}

interface ComponentStats {
  name: string;
  incomingFlows: number;
  outgoingFlows: number;
  totalFlows: number;
  flowTypes: Set<string>;
  isBottleneck: boolean;
  isPivotal: boolean;
}

interface FlowTypeStats {
  type: string;
  count: number;
  percentage: number;
}

const DataFlowSection: React.FC<DataFlowSectionProps> = ({ dataFlow }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'flows' | 'network'>('insights');
  const [selectedFlowType, setSelectedFlowType] = useState<string>('all');
  const [expandedBottleneck, setExpandedBottleneck] = useState<string | null>(null);
  const [expandedPivotal, setExpandedPivotal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate analytics and insights
  const analytics = useMemo(() => {
    const componentMap = new Map<string, ComponentStats>();
    const flowTypeMap = new Map<string, number>();
    
    // Initialize component stats
    dataFlow.forEach(flow => {
      [flow.from, flow.to].forEach(component => {
        if (!componentMap.has(component)) {
          componentMap.set(component, {
            name: component,
            incomingFlows: 0,
            outgoingFlows: 0,
            totalFlows: 0,
            flowTypes: new Set(),
            isBottleneck: false,
            isPivotal: false
          });
        }
      });
    });

    // Calculate flow statistics
    dataFlow.forEach(flow => {
      const fromComp = componentMap.get(flow.from)!;
      const toComp = componentMap.get(flow.to)!;
      
      fromComp.outgoingFlows++;
      fromComp.totalFlows++;
      fromComp.flowTypes.add(flow.type);
      
      toComp.incomingFlows++;
      toComp.totalFlows++;
      toComp.flowTypes.add(flow.type);
      
      // Track flow types
      flowTypeMap.set(flow.type, (flowTypeMap.get(flow.type) || 0) + 1);
    });

    // Identify bottlenecks and pivotal components
    const components = Array.from(componentMap.values());
    const avgFlows = components.reduce((sum, comp) => sum + comp.totalFlows, 0) / components.length;
    
    components.forEach(comp => {
      comp.isBottleneck = comp.incomingFlows > avgFlows * 1.5 || comp.outgoingFlows > avgFlows * 1.5;
      comp.isPivotal = comp.totalFlows > avgFlows * 2;
    });

    // Calculate flow type percentages
    const totalFlows = dataFlow.length;
    const flowTypeStats: FlowTypeStats[] = Array.from(flowTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalFlows) * 100)
    })).sort((a, b) => b.count - a.count);

    return {
      components: components.sort((a, b) => b.totalFlows - a.totalFlows),
      flowTypeStats,
      bottlenecks: components.filter(c => c.isBottleneck),
      pivotalComponents: components.filter(c => c.isPivotal),
      totalComponents: components.length,
      avgFlowsPerComponent: Math.round(avgFlows * 10) / 10
    };
  }, [dataFlow]);

  // Filter flows by type and search term
  const filteredFlows = useMemo(() => {
    let flows = selectedFlowType === 'all' ? dataFlow : dataFlow.filter(flow => flow.type === selectedFlowType);
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      flows = flows.filter(flow => 
        flow.from.toLowerCase().includes(term) ||
        flow.to.toLowerCase().includes(term) ||
        flow.type.toLowerCase().includes(term) ||
        flow.description.toLowerCase().includes(term)
      );
    }
    
    return flows;
  }, [dataFlow, selectedFlowType, searchTerm]);

  // Filter components for network tab based on search term
  const filteredComponents = useMemo(() => {
    if (!searchTerm.trim()) return analytics.components;
    
    const term = searchTerm.toLowerCase();
    return analytics.components.filter(comp => 
      comp.name.toLowerCase().includes(term)
    );
  }, [analytics.components, searchTerm]);

  // Get detailed information about a component
  const getComponentDetails = (componentName: string) => {
    const incomingFlows = dataFlow.filter(flow => flow.to === componentName);
    const outgoingFlows = dataFlow.filter(flow => flow.from === componentName);
    const connectedComponents = new Set([
      ...incomingFlows.map(f => f.from),
      ...outgoingFlows.map(f => f.to)
    ]);

    // Group flows by type
    const flowTypeBreakdown = [...incomingFlows, ...outgoingFlows].reduce((acc, flow) => {
      acc[flow.type] = (acc[flow.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      incomingFlows,
      outgoingFlows,
      connectedComponents: Array.from(connectedComponents),
      flowTypeBreakdown,
      totalConnections: connectedComponents.size,
      dominantFlowType: Object.entries(flowTypeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
    };
  };

  // Helper function to format component names with better context
  const formatComponentName = (name: string) => {
    // If it's a generic name, flag it for better visibility
    const genericNames = ['Parent Component', 'Child Component', 'Main Component', 'Container', 'Wrapper'];
    const isGeneric = genericNames.some(generic => name.includes(generic));
    
    // Handle new ">" notation (e.g., "route.ts > POST")
    const hasInternalFunction = name.includes(' > ');
    const fileName = hasInternalFunction ? name.split(' > ')[0] : name;
    const functionName = hasInternalFunction ? name.split(' > ')[1] : null;
    
    return {
      displayName: name,
      isGeneric,
      fileName,
      functionName,
      shortName: functionName || (name.includes('.') ? name.split('.').pop() : name),
      path: name.includes('/') ? name.split('/').slice(0, -1).join('/') : null,
      hasInternalFunction
    };
  };

  const getFlowTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'props': 'bg-blue-100 text-blue-800 border-blue-200',
      'state': 'bg-green-100 text-green-800 border-green-200',
      'api': 'bg-purple-100 text-purple-800 border-purple-200',
      'event': 'bg-orange-100 text-orange-800 border-orange-200',
      'context': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'callback': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Flow type tooltip content
  const getFlowTypeTooltip = (type: string) => {
    const tooltipData: Record<string, { title: string; description: string; examples: string[] }> = {
      'props': {
        title: 'Props Flow',
        description: 'Data passed from parent to child components as properties',
        examples: ['Component props', 'Configuration data', 'Event handlers passed down']
      },
      'state': {
        title: 'State Flow',
        description: 'Local component state or global state management updates',
        examples: ['useState updates', 'Redux state changes', 'Context state updates']
      },
      'api': {
        title: 'API Flow',
        description: 'Data exchange with external services or backend APIs',
        examples: ['REST API calls', 'GraphQL queries', 'WebSocket messages']
      },
      'event': {
        title: 'Event Flow',
        description: 'User interactions and DOM events triggering data changes',
        examples: ['Click handlers', 'Form submissions', 'Keyboard events']
      },
      'context': {
        title: 'Context Flow',
        description: 'React Context or global context data sharing between components',
        examples: ['Theme context', 'User authentication context', 'Global settings']
      },
      'callback': {
        title: 'Callback Flow',
        description: 'Function callbacks that pass data back to parent components',
        examples: ['onSubmit callbacks', 'onChange handlers', 'Custom event callbacks']
      },
      'api call': {
        title: 'API Call Flow',
        description: 'Direct calls to external APIs or services to fetch or send data',
        examples: ['fetch() requests', 'Axios API calls', 'Database queries', 'Third-party service calls']
      },
      'function call': {
        title: 'Function Call Flow',
        description: 'Data passing between functions through parameters and return values',
        examples: ['Function parameters', 'Return values', 'Utility function calls', 'Helper functions']
      },
      'configuration': {
        title: 'Configuration Flow',
        description: 'Settings and configuration data that controls how components behave',
        examples: ['App settings', 'Feature flags', 'Environment variables', 'Theme configurations']
      },
      'data': {
        title: 'Data Flow',
        description: 'General data transfer between components or modules',
        examples: ['Shared data objects', 'Model data', 'Computed values', 'Processed information']
      },
      'ref': {
        title: 'Ref Flow',
        description: 'React refs used to access DOM elements or component instances',
        examples: ['useRef references', 'DOM element access', 'Component instance refs', 'Imperative API calls']
      },
      'hook': {
        title: 'Hook Flow',
        description: 'Custom React hooks sharing logic and state between components',
        examples: ['Custom hooks', 'useEffect data', 'useMemo values', 'useCallback functions']
      },
      'route': {
        title: 'Route Flow',
        description: 'Navigation and routing data like URL parameters and route state',
        examples: ['URL parameters', 'Route state', 'Navigation data', 'Query parameters']
      },
      'storage': {
        title: 'Storage Flow',
        description: 'Data stored in browser storage or external storage systems',
        examples: ['localStorage data', 'sessionStorage', 'IndexedDB', 'Cookies']
      }
    };

    const data = tooltipData[type.toLowerCase()];
    if (!data) {
      return (
        <div className="text-left">
          <div className="font-semibold text-white mb-2">{type}</div>
          <div className="text-gray-200">Custom flow type in your application</div>
        </div>
      );
    }

    return (
      <div className="text-left">
        <div className="font-semibold text-white mb-2">{data.title}</div>
        <div className="text-gray-200 mb-3 leading-relaxed">{data.description}</div>
        <div className="pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400 mb-2">
            <span className="font-medium">Common Examples:</span>
          </div>
          {data.examples.map((example, index) => (
            <div key={index} className="text-xs text-gray-300 mb-1">• {example}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <ArrowRight size={20} className="mr-2 text-orange-600" />
      Data Flow Analysis
        <span className="ml-3 text-sm font-normal text-gray-500">
          ({dataFlow.length} flows)
        </span>
    </h3>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows by component names, types, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 border-l-4 border-orange-500 p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>Data Flow Analysis</strong> reveals how information moves through your application, identifying 
          critical pathways, potential bottlenecks, and architectural patterns that impact performance and maintainability.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={16} className="inline mr-2" />
          Insights
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'network'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Network size={16} className="inline mr-2" />
          Component Network
        </button>
        <button
          onClick={() => setActiveTab('flows')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'flows'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Filter size={16} className="inline mr-2" />
          All Flows
        </button>
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalComponents}</div>
              <div className="text-sm text-blue-800">Connected Components</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.avgFlowsPerComponent}</div>
              <div className="text-sm text-green-800">Avg Flows/Component</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.bottlenecks.length}</div>
              <div className="text-sm text-red-800">Potential Bottlenecks</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.flowTypeStats.length}</div>
              <div className="text-sm text-purple-800">Flow Types</div>
            </div>
          </div>

          {/* Flow Type Breakdown */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">📊 Flow Types Distribution</h4>
            <div className="space-y-2">
              {analytics.flowTypeStats.map(stat => (
                <div key={stat.type} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Tooltip
                        content={getFlowTypeTooltip(stat.type)}
                        position="top"
                        maxWidth="400px"
                        delay={300}
                      >
                        <span className={`text-sm px-2 py-1 rounded border cursor-help hover:opacity-80 transition-opacity ${getFlowTypeColor(stat.type)}`}>
                          {stat.type}
                        </span>
                      </Tooltip>
                      <span className="text-sm text-gray-600">{stat.count} flows ({stat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Components */}
          {analytics.bottlenecks.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <AlertTriangle size={16} className="mr-2 text-red-500" />
                Potential Bottlenecks
              </h4>
              <div className="space-y-2">
                {analytics.bottlenecks.slice(0, 5).map(comp => {
                  const isExpanded = expandedBottleneck === comp.name;
                  const details = isExpanded ? getComponentDetails(comp.name) : null;
                  const nameInfo = formatComponentName(comp.name);
                  
                  return (
                    <div key={comp.name}>
                      <div 
                        className="bg-red-50 border border-red-200 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => setExpandedBottleneck(isExpanded ? null : comp.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {nameInfo.hasInternalFunction ? (
                                <div className="flex items-center">
                                  <span className="font-medium text-red-800">{nameInfo.fileName}</span>
                                  <span className="mx-1 text-red-600">›</span>
                                  <span className="font-medium text-red-700 bg-red-100 px-2 py-1 rounded text-xs">
                                    {nameInfo.functionName}
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-medium text-red-800 ${nameInfo.isGeneric ? 'text-red-600' : ''}`}>
                                  {nameInfo.displayName}
                                </span>
                              )}
                              {nameInfo.isGeneric && (
                                <span className="ml-2 text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                                  AI-Generated Name
                                </span>
                              )}
                            </div>
                            {nameInfo.path && (
                              <span className="text-xs text-red-600 mt-1">📁 {nameInfo.path}/</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-red-600">
                              {comp.incomingFlows}↓ {comp.outgoingFlows}↑
                            </div>
                            <div className="text-red-600">
                              {isExpanded ? '−' : '+'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          High flow volume may indicate tight coupling or over-responsibility
                        </div>
                      </div>
                      
                      {isExpanded && details && (
                        <div className="mt-2 bg-white border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-800">Detailed Analysis</h5>
                            {nameInfo.isGeneric && (
                              <span className="text-xs text-gray-500">
                                💡 Run new analysis for better component names
                              </span>
                            )}
                          </div>
                          
                          {/* Flow Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Flow Types</h6>
                              <div className="space-y-1">
                                {Object.entries(details.flowTypeBreakdown).map(([type, count]) => (
                                  <div key={type} className="flex justify-between text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${getFlowTypeColor(type)}`}>
                                      {type}
                                    </span>
                                    <span className="text-gray-600">{count} flows</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Connected Components</h6>
                              <div className="text-sm text-gray-600">
                                <div className="mb-1">Total connections: <span className="font-medium">{details.totalConnections}</span></div>
                                <div className="mb-1">Dominant flow: <span className="font-medium">{details.dominantFlowType}</span></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Recommendations */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <h6 className="text-sm font-medium text-yellow-800 mb-2">💡 Recommendations</h6>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              <li>• Consider splitting this component into smaller, more focused components</li>
                              <li>• Review if all data flows are necessary or if some can be optimized</li>
                              <li>• Use composition patterns to reduce direct dependencies</li>
                              {details.dominantFlowType === 'props' && (
                                <li>• Consider using Context for deeply nested prop passing</li>
                              )}
                              {details.dominantFlowType === 'state' && (
                                <li>• Consider moving state closer to where it's used</li>
                              )}
                            </ul>
                          </div>
                          
                          {/* Connected Components List */}
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Connected Components ({details.totalConnections})</h6>
                            <div className="flex flex-wrap gap-1">
                              {details.connectedComponents.slice(0, 10).map(connectedComp => (
                                <span key={connectedComp} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {connectedComp}
                                </span>
                              ))}
                              {details.connectedComponents.length > 10 && (
                                <span className="text-xs text-gray-500">
                                  +{details.connectedComponents.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pivotal Components */}
          {analytics.pivotalComponents.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Zap size={16} className="mr-2 text-yellow-500" />
                Pivotal Components
              </h4>
              <div className="space-y-2">
                {analytics.pivotalComponents.slice(0, 5).map(comp => {
                  const isExpanded = expandedPivotal === comp.name;
                  const details = isExpanded ? getComponentDetails(comp.name) : null;
                  const nameInfo = formatComponentName(comp.name);
                  
                  return (
                    <div key={comp.name}>
                      <div 
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
                        onClick={() => setExpandedPivotal(isExpanded ? null : comp.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {nameInfo.hasInternalFunction ? (
                                <div className="flex items-center">
                                  <span className="font-medium text-yellow-800">{nameInfo.fileName}</span>
                                  <span className="mx-1 text-yellow-600">›</span>
                                  <span className="font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">
                                    {nameInfo.functionName}
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-medium text-yellow-800 ${nameInfo.isGeneric ? 'text-yellow-600' : ''}`}>
                                  {nameInfo.displayName}
                                </span>
                              )}
                              {nameInfo.isGeneric && (
                                <span className="ml-2 text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                                  AI-Generated Name
                                </span>
                              )}
                            </div>
                            {nameInfo.path && (
                              <span className="text-xs text-yellow-600 mt-1">📁 {nameInfo.path}/</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-yellow-600">
                              {comp.totalFlows} total flows
                            </div>
                            <div className="text-yellow-600">
                              {isExpanded ? '−' : '+'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Central to data architecture - changes may have wide impact
                        </div>
                      </div>
                      
                      {isExpanded && details && (
                        <div className="mt-2 bg-white border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-800">Impact Analysis</h5>
                            {nameInfo.isGeneric && (
                              <span className="text-xs text-gray-500">
                                💡 Run new analysis for better component names
                              </span>
                            )}
                          </div>
                          
                          {/* Flow Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Flow Types</h6>
                              <div className="space-y-1">
                                {Object.entries(details.flowTypeBreakdown).map(([type, count]) => (
                                  <div key={type} className="flex justify-between text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${getFlowTypeColor(type)}`}>
                                      {type}
                                    </span>
                                    <span className="text-gray-600">{count} flows</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Impact Metrics</h6>
                              <div className="text-sm text-gray-600">
                                <div className="mb-1">Components affected: <span className="font-medium">{details.totalConnections}</span></div>
                                <div className="mb-1">Primary role: <span className="font-medium">{details.dominantFlowType} hub</span></div>
                                <div className="mb-1">Incoming: <span className="font-medium">{details.incomingFlows.length}</span></div>
                                <div className="mb-1">Outgoing: <span className="font-medium">{details.outgoingFlows.length}</span></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Impact Assessment */}
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <h6 className="text-sm font-medium text-blue-800 mb-2">📈 Change Impact Assessment</h6>
                            <ul className="text-xs text-blue-700 space-y-1">
                              <li>• Changes to this component may affect <strong>{details.totalConnections}</strong> other components</li>
                              <li>• High test coverage recommended due to wide integration</li>
                              <li>• Consider versioning or feature flags for major changes</li>
                              {details.incomingFlows.length > details.outgoingFlows.length && (
                                <li>• This is primarily a data consumer - focus on input validation</li>
                              )}
                              {details.outgoingFlows.length > details.incomingFlows.length && (
                                <li>• This is primarily a data provider - ensure stable API</li>
                              )}
                              {details.dominantFlowType === 'api' && (
                                <li>• API changes here will cascade through the system</li>
                              )}
                            </ul>
                          </div>
                          
                          {/* Connected Components List */}
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Dependent Components ({details.totalConnections})</h6>
                            <div className="flex flex-wrap gap-1">
                              {details.connectedComponents.slice(0, 10).map(connectedComp => (
                                <span key={connectedComp} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {connectedComp}
                                </span>
                              ))}
                              {details.connectedComponents.length > 10 && (
                                <span className="text-xs text-gray-500">
                                  +{details.connectedComponents.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Component Network Tab */}
      {activeTab === 'network' && (
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Component Flow Statistics</h4>
          <div className="max-h-96 overflow-y-auto">
            {filteredComponents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No components found matching "{searchTerm}"</p>
              </div>
            ) : (
    <div className="space-y-3">
                {filteredComponents.map(comp => {
                const nameInfo = formatComponentName(comp.name);
                return (
                <div 
                  key={comp.name} 
                  className={`p-4 rounded-lg border ${
                    comp.isBottleneck ? 'bg-red-50 border-red-200' :
                    comp.isPivotal ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {nameInfo.hasInternalFunction ? (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800">{nameInfo.fileName}</span>
                            <span className="mx-1 text-gray-600">›</span>
                            <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                              {nameInfo.functionName}
                            </span>
                          </div>
                        ) : (
                          <span className={`font-medium ${nameInfo.isGeneric ? 'text-gray-600' : 'text-gray-800'}`}>
                            {nameInfo.displayName}
                          </span>
                        )}
                        {nameInfo.isGeneric && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            AI-Generated
                          </span>
                        )}
                      </div>
                      {nameInfo.path && (
                        <span className="text-xs text-gray-500 mt-1">📁 {nameInfo.path}/</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-green-600">{comp.incomingFlows}↓</span>
                      <span className="text-blue-600">{comp.outgoingFlows}↑</span>
                      <span className="text-gray-600">Total: {comp.totalFlows}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(comp.flowTypes).map(type => (
                      <Tooltip
                        key={type}
                        content={getFlowTypeTooltip(type)}
                        position="top"
                        maxWidth="400px"
                        delay={300}
                      >
                        <span className={`text-xs px-2 py-1 rounded border cursor-help hover:opacity-80 transition-opacity ${getFlowTypeColor(type)}`}>
                          {type}
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                  {comp.isBottleneck && (
                    <div className="text-xs text-red-600 mt-2">⚠️ Potential bottleneck</div>
                  )}
                  {comp.isPivotal && (
                    <div className="text-xs text-yellow-600 mt-2">⭐ Pivotal component</div>
                  )}
                </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* All Flows Tab */}
      {activeTab === 'flows' && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h4 className="font-medium text-gray-700">All Data Flows</h4>
            <select
              value={selectedFlowType}
              onChange={(e) => setSelectedFlowType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Types</option>
              {analytics.flowTypeStats.map(stat => (
                <option key={stat.type} value={stat.type}>
                  {stat.type} ({stat.count})
                </option>
              ))}
            </select>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredFlows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No flows found matching "{searchTerm}" {selectedFlowType !== 'all' && `for type "${selectedFlowType}"`}</p>
              </div>
            ) : (
              filteredFlows.map((flow, index) => {
              const fromInfo = formatComponentName(flow.from);
              const toInfo = formatComponentName(flow.to);
              
              return (
        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    {fromInfo.hasInternalFunction ? (
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-gray-800">{fromInfo.fileName}</span>
                        <span className="mx-1 text-gray-600 text-sm">›</span>
                        <span className="font-medium text-xs text-gray-700 bg-gray-100 px-1 py-0.5 rounded">
                          {fromInfo.functionName}
                        </span>
                      </div>
                    ) : (
                      <span className={`font-medium text-sm ${fromInfo.isGeneric ? 'text-gray-600' : 'text-gray-800'}`}>
                        {fromInfo.displayName}
                      </span>
                    )}
                    {fromInfo.isGeneric && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">AI</span>
                    )}
                  </div>
                  {fromInfo.path && (
                    <span className="text-xs text-gray-500">📁 {fromInfo.path}/</span>
                  )}
                </div>
          <ArrowRight size={16} className="mx-3 text-gray-400" />
                <div className="flex flex-col">
                  <div className="flex items-center">
                    {toInfo.hasInternalFunction ? (
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-gray-800">{toInfo.fileName}</span>
                        <span className="mx-1 text-gray-600 text-sm">›</span>
                        <span className="font-medium text-xs text-gray-700 bg-gray-100 px-1 py-0.5 rounded">
                          {toInfo.functionName}
                        </span>
                      </div>
                    ) : (
                      <span className={`font-medium text-sm ${toInfo.isGeneric ? 'text-gray-600' : 'text-gray-800'}`}>
                        {toInfo.displayName}
                      </span>
                    )}
                    {toInfo.isGeneric && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">AI</span>
                    )}
                  </div>
                  {toInfo.path && (
                    <span className="text-xs text-gray-500">📁 {toInfo.path}/</span>
                  )}
                </div>
          <div className="ml-auto text-right">
                  <Tooltip
                    content={getFlowTypeTooltip(flow.type)}
                    position="left"
                    maxWidth="400px"
                    delay={300}
                  >
                    <div className={`text-xs px-2 py-1 rounded border mb-1 cursor-help hover:opacity-80 transition-opacity ${getFlowTypeColor(flow.type)}`}>
              {flow.type}
            </div>
                  </Tooltip>
            <div className="text-xs text-gray-600">{flow.description}</div>
                </div>
              </div>
              );
            })
            )}
          </div>
        </div>
      )}
  </div>
);
};

export default DataFlowSection; 