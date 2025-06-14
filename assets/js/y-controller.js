// y-controller.js
// Controller for managing Spline object through mouse movements using spline-viewer

(function() {
    'use strict';
    
    class SplineMouseController {
        constructor() {
            this.splineViewer = null;
            this.splineApp = null;
            this.isLoaded = false;
            this.sensitivity = 1;
            this.currentRotationY = 0;
            this.lastMouseX = 0;
            this.variableName = 'ShroomY'; // Replace with your variable name
            this.mode = 'absolute'; // 'absolute' or 'relative'
            
            this.init();
        }
        
        async init() {
            console.log('Initializing Spline Mouse Controller...');
            
            // Wait for spline-viewer element to be available
            await this.waitForSplineViewer();
            
            // Find spline-viewer element
            this.splineViewer = document.querySelector('spline-viewer');
            if (!this.splineViewer) {
                console.error('spline-viewer element not found.');
                return;
            }
            
            console.log('spline-viewer element found');
            
            // Wait for spline-viewer to load with multiple approaches
            this.splineViewer.addEventListener('load', () => {
                this.handleSplineLoad();
            });
            
            // Fallback - try to get app after delay
            setTimeout(() => {
                if (!this.isLoaded) {
                    console.log('Trying fallback approach to get spline app...');
                    this.handleSplineLoad();
                }
            }, 2000);
            
            // Another fallback - check periodically
            const checkInterval = setInterval(() => {
                if (!this.isLoaded && this.tryGetSplineApp()) {
                    clearInterval(checkInterval);
                    this.handleSplineLoad();
                }
            }, 500);
            
            // Handle loading errors
            this.splineViewer.addEventListener('error', (error) => {
                console.error('Error loading Spline scene:', error);
            });
        }
        
        async waitForSplineViewer() {
            // Wait for spline-viewer custom element to be defined
            return new Promise((resolve) => {
                if (customElements.get('spline-viewer')) {
                    console.log('spline-viewer already defined');
                    resolve();
                } else {
                    console.log('Waiting for spline-viewer to be defined...');
                    customElements.whenDefined('spline-viewer').then(() => {
                        console.log('spline-viewer defined');
                        resolve();
                    });
                }
            });
        }
        
        tryGetSplineApp() {
            // Try multiple ways to access the spline application
            const attempts = [
                () => this.splineViewer.spline,
                () => this.splineViewer._spline,
                () => this.splineViewer.application,
                () => this.splineViewer._application,
                () => this.splineViewer.splineApp,
                () => this.splineViewer.app
            ];
            
            for (let attempt of attempts) {
                try {
                    const app = attempt();
                    if (app && typeof app === 'object') {
                        console.log('Found spline app via:', attempt.toString());
                        this.splineApp = app;
                        return true;
                    }
                } catch (e) {
                    // Ignore errors, try next approach
                }
            }
            
            return false;
        }
        
        handleSplineLoad() {
            console.log('Handling spline load...');
            
            if (!this.splineApp) {
                if (!this.tryGetSplineApp()) {
                    console.error('Could not get spline application instance');
                    return;
                }
            }
            
            this.isLoaded = true;
            console.log('Spline application instance obtained successfully');
            console.log('Available methods:', Object.getOwnPropertyNames(this.splineApp));
            this.setupEventListeners();
            
            // Test variable setting
            this.testVariableAccess();
        }
        
        testVariableAccess() {
            console.log('=== DETAILED VARIABLE INVESTIGATION ===');
            
            try {
                // 1. Check all available properties on splineApp
                console.log('1. SplineApp properties:', Object.getOwnPropertyNames(this.splineApp));
                console.log('1. SplineApp descriptor:', Object.getOwnPropertyDescriptors(this.splineApp));
                
                // 2. Check variables object
                if (this.splineApp.variables) {
                    console.log('2. Variables object exists');
                    console.log('2. Variables type:', typeof this.splineApp.variables);
                    console.log('2. Variables keys:', Object.keys(this.splineApp.variables));
                    console.log('2. Variables values:', this.splineApp.variables);
                } else {
                    console.log('2. ❌ Variables object does not exist');
                }
                
                // 3. Check scene object
                if (this.splineApp.scene) {
                    console.log('3. Scene object exists');
                    console.log('3. Scene properties:', Object.getOwnPropertyNames(this.splineApp.scene));
                    
                    if (this.splineApp.scene.variables) {
                        console.log('3. Scene.variables:', this.splineApp.scene.variables);
                        console.log('3. Scene.variables keys:', Object.keys(this.splineApp.scene.variables));
                    }
                } else {
                    console.log('3. ❌ Scene object does not exist');
                }
                
                // 4. Check for alternative variable access methods
                const variableProps = ['variables', '_variables', 'globalVariables', '_globalVariables', 'sceneVariables'];
                variableProps.forEach(prop => {
                    if (this.splineApp[prop]) {
                        console.log(`4. Found ${prop}:`, this.splineApp[prop]);
                        if (typeof this.splineApp[prop] === 'object') {
                            console.log(`4. ${prop} keys:`, Object.keys(this.splineApp[prop]));
                        }
                    }
                });
                
                // 5. Search for ShroomY in all nested objects
                console.log('5. Searching for "ShroomY" in all nested objects...');
                this.deepSearchForVariable(this.splineApp, 'ShroomY', 'splineApp');
                
                // 6. Search for any variables containing "shroom" (case insensitive)
                console.log('6. Searching for variables containing "shroom"...');
                this.searchForSimilarVariables(this.splineApp, 'shroom');
                
                // 7. Try different methods to list all variables
                const methods = [
                    () => this.splineApp.getVariables?.(),
                    () => this.splineApp.getAllVariables?.(),
                    () => this.splineApp.listVariables?.(),
                    () => this.splineApp.scene?.getVariables?.(),
                    () => this.splineApp.scene?.getAllVariables?.()
                ];
                
                methods.forEach((method, index) => {
                    try {
                        const result = method();
                        if (result) {
                            console.log(`7.${index} Method ${index} returned:`, result);
                        }
                    } catch (e) {
                        // Silent fail
                    }
                });
                
                // 8. Try different setVariable approaches
                console.log('8. Testing different setVariable approaches...');
                const testMethods = [
                    { name: 'splineApp.setVariable', fn: () => this.splineApp.setVariable(this.variableName, 0) },
                    { name: 'splineViewer.setVariable', fn: () => this.splineViewer.setVariable(this.variableName, 0) },
                    { name: 'splineApp.setGlobalVariable', fn: () => this.splineApp.setGlobalVariable?.(this.variableName, 0) },
                    { name: 'splineApp.variables direct', fn: () => this.splineApp.variables && (this.splineApp.variables[this.variableName] = 0) },
                    { name: 'splineApp.scene.setVariable', fn: () => this.splineApp.scene?.setVariable?.(this.variableName, 0) },
                    { name: 'splineApp.updateVariable', fn: () => this.splineApp.updateVariable?.(this.variableName, 0) }
                ];
                
                let workingMethod = null;
                for (let method of testMethods) {
                    try {
                        method.fn();
                        workingMethod = method.name;
                        console.log(`8. ✓ Variable accessible via: ${method.name}`);
                        break;
                    } catch (e) {
                        console.log(`8. ✗ ${method.name} failed:`, e.message);
                    }
                }
                
                if (!workingMethod) {
                    console.log('8. ❌ No working method found for setting variables');
                }
                
                // 9. Check splineViewer for variables
                console.log('9. Checking splineViewer properties...');
                const viewerProps = Object.getOwnPropertyNames(this.splineViewer);
                const variableRelated = viewerProps.filter(prop => 
                    prop.toLowerCase().includes('variable') || 
                    prop.toLowerCase().includes('param')
                );
                console.log('9. Variable-related properties on splineViewer:', variableRelated);
                
                // 10. Final summary
                console.log('=== INVESTIGATION COMPLETE ===');
                
            } catch (error) {
                console.error('Error during variable investigation:', error);
            }
        }
        
        deepSearchForVariable(obj, searchTerm, path = '') {
            if (!obj || typeof obj !== 'object') return;
            
            try {
                for (let key in obj) {
                    const currentPath = path ? `${path}.${key}` : key;
                    
                    // Check if key matches
                    if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                        console.log(`🔍 Found key "${key}" at path: ${currentPath}`);
                        console.log(`🔍 Value:`, obj[key]);
                    }
                    
                    // Check if value is ShroomY
                    if (typeof obj[key] === 'string' && obj[key].toLowerCase().includes(searchTerm.toLowerCase())) {
                        console.log(`🔍 Found value "${obj[key]}" at path: ${currentPath}`);
                    }
                    
                    // Recursively search nested objects (limit depth)
                    if (typeof obj[key] === 'object' && obj[key] !== null && path.split('.').length < 3) {
                        this.deepSearchForVariable(obj[key], searchTerm, currentPath);
                    }
                }
            } catch (e) {
                // Ignore circular references and access errors
            }
        }
        
        searchForSimilarVariables(obj, searchTerm) {
            const found = [];
            
            const search = (object, path = '') => {
                if (!object || typeof object !== 'object') return;
                
                try {
                    for (let key in object) {
                        if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                            found.push({ key, value: object[key], path: path ? `${path}.${key}` : key });
                        }
                        
                        if (typeof object[key] === 'object' && object[key] !== null && path.split('.').length < 2) {
                            search(object[key], path ? `${path}.${key}` : key);
                        }
                    }
                } catch (e) {
                    // Ignore errors
                }
            };
            
            search(obj);
            
            if (found.length > 0) {
                console.log('🎯 Similar variables found:', found);
            } else {
                console.log('🎯 No similar variables found');
            }
        }
        
        setupEventListeners() {
            console.log('Setting up event listeners...');
            
            // Mouse movement handler
            document.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });
            
            // Reset on click (optional)
            document.addEventListener('click', () => {
                this.resetRotation();
            });
            
            console.log('Event listeners set up successfully');
        }
        
        handleMouseMove(event) {
            if (!this.isLoaded) return;
            
            if (this.mode === 'absolute') {
                this.handleAbsoluteMovement(event);
            } else {
                this.handleRelativeMovement(event);
            }
        }
        
        handleAbsoluteMovement(event) {
            // Get window dimensions
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // Normalize mouse coordinates from -1 to 1
            const normalizedX = (event.clientX / windowWidth) * 2 - 1;
            const normalizedY = -((event.clientY / windowHeight) * 2 - 1);
            
            // Convert to angles with limits
            let rotationY = normalizedX * 180 * this.sensitivity;
            
            // Clamp rotation between -180 and 180 degrees
            rotationY = Math.max(-180, Math.min(180, rotationY));
            
            // Update Spline variable
            this.updateSplineVariable(rotationY);
        }
        
        handleRelativeMovement(event) {
            // Calculate movement delta
            const deltaX = event.clientX - this.lastMouseX;
            this.lastMouseX = event.clientX;
            
            // Update accumulated rotation
            this.currentRotationY += deltaX * this.sensitivity * 0.5;
            
            // Update Spline variable
            this.updateSplineVariable(this.currentRotationY);
        }
        
        updateSplineVariable(value) {
            if (!this.isLoaded) return;
            
            try {
                // Try multiple approaches to set variable
                const setMethods = [
                    () => this.splineApp.setVariable(this.variableName, value),
                    () => this.splineViewer.setVariable(this.variableName, value),
                    () => this.splineApp.setGlobalVariable(this.variableName, value),
                    () => this.splineApp.variables && (this.splineApp.variables[this.variableName] = value),
                    () => this.splineApp.scene && this.splineApp.scene.setVariable(this.variableName, value)
                ];
                
                let success = false;
                for (let i = 0; i < setMethods.length; i++) {
                    try {
                        setMethods[i]();
                        if (!success) {
                            console.log(`Variable set successfully using method ${i + 1}`);
                            success = true;
                        }
                        break;
                    } catch (e) {
                        if (i === setMethods.length - 1) {
                            console.warn('All setVariable methods failed:', e);
                        }
                    }
                }
                
                // Debug log (remove after testing)
                if (success && Math.abs(value) > 0.1) {
                    console.log(`Variable ${this.variableName} set to: ${value.toFixed(2)}`);
                }
                
            } catch (error) {
                console.error('Error updating Spline variable:', error);
            }
        }
        
        resetRotation() {
            if (!this.isLoaded) return;
            
            console.log('Resetting rotation...');
            this.currentRotationY = 0;
            this.updateSplineVariable(0);
        }
        
        // Public methods for configuration
        setMode(mode) {
            if (mode === 'absolute' || mode === 'relative') {
                this.mode = mode;
                console.log(`Mode changed to: ${mode}`);
            }
        }
        
        setSensitivity(value) {
            this.sensitivity = value;
            console.log(`Sensitivity set to: ${value}`);
        }
        
        setVariableName(name) {
            this.variableName = name;
            console.log(`Variable name changed to: ${name}`);
            
            // Test the new variable immediately
            if (this.isLoaded) {
                this.testVariableAccess();
            }
        }
        
        // Get spline application instance (if needed for advanced operations)
        getSplineApp() {
            return this.splineApp;
        }
        
        // Debug method to check what's available
        debugSplineAPI() {
            console.log('=== Spline API Debug ===');
            console.log('splineViewer:', this.splineViewer);
            console.log('splineApp:', this.splineApp);
            console.log('isLoaded:', this.isLoaded);
            
            if (this.splineViewer) {
                console.log('splineViewer properties:', Object.getOwnPropertyNames(this.splineViewer));
            }
            
            if (this.splineApp) {
                console.log('splineApp properties:', Object.getOwnPropertyNames(this.splineApp));
            }
        }
    }
    
    // Initialize after DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, creating Spline controller...');
        // Create global controller instance
        window.splineController = new SplineMouseController();
    });
    
    // Global functions for convenience
    window.setSplineMode = function(mode) {
        if (window.splineController) {
            window.splineController.setMode(mode);
        }
    };
    
    window.setSplineSensitivity = function(value) {
        if (window.splineController) {
            window.splineController.setSensitivity(value);
        }
    };
    
    window.setSplineVariable = function(name) {
        if (window.splineController) {
            window.splineController.setVariableName(name);
        }
    };
    
    window.resetSplineRotation = function() {
        if (window.splineController) {
            window.splineController.resetRotation();
        }
    };
    
    // Debug function
    window.debugSpline = function() {
        if (window.splineController) {
            window.splineController.debugSplineAPI();
        }
    };
    
    // Detailed investigation function
    window.investigateVariables = function() {
        if (window.splineController && window.splineController.isLoaded) {
            console.log('🔬 Starting detailed variable investigation...');
            window.splineController.testVariableAccess();
        } else {
            console.log('❌ Spline controller not loaded yet. Wait a moment and try again.');
        }
    };
    
    // Function to get actual variables from spline file
    window.getSplineVariables = function() {
        if (!window.splineController || !window.splineController.splineApp) {
            console.log('❌ Spline not loaded');
            return;
        }
        
        const app = window.splineController.splineApp;
        console.log('🔍 Searching for variables in spline file...');
        
        // Method 1: Try to get variable metadata
        try {
            const metadata = app.metadata || app._metadata || app.sceneMetadata;
            if (metadata) {
                console.log('📋 Metadata found:', metadata);
                if (metadata.variables) {
                    console.log('✅ Variables from metadata:', metadata.variables);
                }
            }
        } catch (e) {
            console.log('No metadata found');
        }
        
        // Method 2: Try to access scene data
        try {
            const sceneData = app.sceneData || app._sceneData || app.scene;
            if (sceneData) {
                console.log('📋 Scene data found:', sceneData);
            }
        } catch (e) {
            console.log('No scene data found');
        }
        
        // Method 3: Check splineViewer for variables
        const viewer = window.splineController.splineViewer;
        if (viewer) {
            console.log('🔍 Checking splineViewer for variables...');
            
            // Try different approaches
            const checks = [
                () => viewer.variables,
                () => viewer._variables,
                () => viewer.getVariables?.(),
                () => viewer.scene?.variables,
                () => viewer.app?.variables,
                () => viewer.runtime?.variables
            ];
            
            checks.forEach((check, i) => {
                try {
                    const result = check();
                    if (result) {
                        console.log(`✅ Method ${i+1} found variables:`, result);
                    }
                } catch (e) {
                    // Silent fail
                }
            });
        }
        
        // Method 4: Try to trigger error with known bad variable name
        try {
            app.setVariable('__DEFINITELY_NOT_EXISTS__', 123);
            console.log('⚠️ setVariable accepts any name (no validation)');
        } catch (e) {
            console.log('✅ setVariable validates names:', e.message);
        }
        
        console.log('🔍 Investigation complete. Check output above for actual variables.');
    };
    
    // Function to test with common variable names
    window.testCommonVariableNames = function() {
        if (!window.splineController?.isLoaded) {
            console.log('❌ Spline not loaded');
            return;
        }
        
        const commonNames = [
            'rotation', 'Rotation', 'ROTATION',
            'rotationY', 'RotationY', 'rotation_y',
            'yRotation', 'YRotation', 'y_rotation',
            'shroom', 'Shroom', 'SHROOM',
            'shroomY', 'ShroomY', 'shroom_y',
            'mouseY', 'MouseY', 'mouse_y',
            'angle', 'Angle', 'ANGLE',
            'yAngle', 'YAngle', 'y_angle'
        ];
        
        console.log('🎯 Testing common variable names...');
        
        commonNames.forEach(name => {
            try {
                window.splineController.splineApp.setVariable(name, 42);
                // If we got here, the method didn't throw an error
                // But that doesn't mean the variable exists!
                console.log(`📝 Tested: ${name} (no error, but may not exist)`);
            } catch (e) {
                console.log(`❌ Failed: ${name} - ${e.message}`);
            }
        });
        
        console.log('💡 Suggestion: Check your Spline project for the exact variable name');
    };
    
})();