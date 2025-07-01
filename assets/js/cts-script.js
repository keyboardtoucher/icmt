(function() {
    'use strict';
    
    // ===== SCRIPT SETTINGS =====
    // Speed multiplier for data transmission to Spline
    var ctsRotationSpeed = 1.0; // Change this value to adjust sensitivity
    
    // ===== INTERNAL SCRIPT VARIABLES =====
    var ctsShroomY = 0; // Main variable for transmission to Spline (0-359)
    var ctsLastMouseX = null; // Last mouse position on X axis
    var ctsLastMouseY = null; // Last mouse position on Y axis
    var ctsContainer = null; // Reference to container
    var ctsSplineApp = null; // Reference to Spline application
    
    // ===== SCRIPT INITIALIZATION =====
    function ctsInit() {
        // Wait for DOM loading
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ctsSetupContainer);
        } else {
            ctsSetupContainer();
        }
    }
    
    // ===== CONTAINER SETUP =====
    function ctsSetupContainer() {
        ctsContainer = document.getElementById('shroom-span');
        
        if (!ctsContainer) {
            console.warn('CTS: Container with id="shroom-span" not found');
            return;
        }
        
        // Add basic styles for proper operation
        ctsContainer.style.position = 'relative';
        ctsContainer.style.overflow = 'hidden';
        
        // Set up mouse event handlers
        ctsContainer.addEventListener('mouseenter', ctsOnMouseEnter);
        ctsContainer.addEventListener('mousemove', ctsOnMouseMove);
        ctsContainer.addEventListener('mouseleave', ctsOnMouseLeave);
        
        // Try to find Spline application
        ctsConnectToSpline();
        
        console.log('CTS: Script initialized successfully');
    }
    
    // ===== SPLINE CONNECTION =====
    function ctsConnectToSpline() {
        // Look for Spline application in global scope
        if (window.spline) {
            ctsSplineApp = window.spline;
            console.log('CTS: Connection to Spline established');
        } else {
            // Try to connect after some time
            setTimeout(ctsConnectToSpline, 500);
        }
    }
    
    // ===== MOUSE EVENT HANDLERS =====
    function ctsOnMouseEnter(event) {
        var rect = ctsContainer.getBoundingClientRect();
        ctsLastMouseX = event.clientX - rect.left;
        ctsLastMouseY = event.clientY - rect.top;
    }
    
    function ctsOnMouseMove(event) {
        if (ctsLastMouseX === null || ctsLastMouseY === null) {
            ctsOnMouseEnter(event);
            return;
        }
        
        var rect = ctsContainer.getBoundingClientRect();
        var currentX = event.clientX - rect.left;
        var currentY = event.clientY - rect.top;
        
        // Calculate pixel displacement
        var deltaX = Math.abs(currentX - ctsLastMouseX);
        var deltaY = Math.abs(currentY - ctsLastMouseY);
        var totalDelta = deltaX + deltaY;
        
        // Apply speed multiplier
        var adjustedDelta = totalDelta * ctsRotationSpeed;
        
        // Update ShroomY with cyclical behavior (0-359)
        ctsShroomY = (ctsShroomY + adjustedDelta) % 360;
        
        // Send value to Spline
        ctsSendToSpline();
        
        // Update last coordinates
        ctsLastMouseX = currentX;
        ctsLastMouseY = currentY;
    }
    
    function ctsOnMouseLeave(event) {
        ctsLastMouseX = null;
        ctsLastMouseY = null;
    }
    
    // ===== DATA TRANSMISSION TO SPLINE =====
    function ctsSendToSpline() {
        if (ctsSplineApp && typeof ctsSplineApp.setVariable === 'function') {
            try {
                ctsSplineApp.setVariable('ShroomY', ctsShroomY);
            } catch (error) {
                console.warn('CTS: Error sending data to Spline:', error);
            }
        } else if (window.spline && typeof window.spline.setVariable === 'function') {
            try {
                window.spline.setVariable('ShroomY', ctsShroomY);
                ctsSplineApp = window.spline;
            } catch (error) {
                console.warn('CTS: Error sending data to Spline:', error);
            }
        }
    }
    
    // ===== PUBLIC METHODS =====
    // Method to get current ShroomY value
    window.ctsGetShroomY = function() {
        return ctsShroomY;
    };
    
    // Method to reset ShroomY value
    window.ctsResetShroomY = function() {
        ctsShroomY = 0;
        ctsSendToSpline();
    };
    
    // Method to change rotation speed
    window.ctsSetRotationSpeed = function(newSpeed) {
        if (typeof newSpeed === 'number' && newSpeed >= 0) {
            ctsRotationSpeed = newSpeed;
            return true;
        }
        return false;
    };
    
    // ===== SCRIPT LAUNCH =====
    ctsInit();
    
})();