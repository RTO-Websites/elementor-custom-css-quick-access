<?php

use ElementorPro\Plugin;
use Elementor\Modules\Library\Documents\FormBuilder;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Elements_Manager;

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.rto.de
 * @since             1.0.0
 * @package           Elementor Custom CSS Quick Access
 *
 * @wordpress-plugin
 * Plugin Name:       Elementor Custom CSS Quick Access (ccqa)
 * Plugin URI:        https://github.com/RTO-Websites/elementor-ccqa
 * Description:       Allows you to get quick access of all custom css while in elementor editor.
 * Version:           0.0.1
 * Author:            Oliver Feustel RTO GmbH
 * Author URI:        https://www.rto.de
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       ElementorFormBuilder
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}



define( 'CCQA_DIR', plugin_dir_path( __FILE__ ));


//add_action( 'elementor_pro/init', 'elementorCcqaInit' );
//
//function elementorCcqaInit(){
//    require_once CCQA_DIR.'theme-builder/formBuilder.php';
//
//}

add_action( 'elementor/editor/before_enqueue_scripts', function () {
    wp_enqueue_script(
        'ccqa-js',
        plugins_url( 'assets/js/editor.js', __FILE__ ),
        [
            'jquery'
        ],
        1,
        true
    );
    wp_enqueue_style(
        'ccqa',
        plugins_url( 'assets/css/ccqa.css', __FILE__ ),
        [],
        1,
        'all'
    );

    require_once plugin_dir_path(  __FILE__ ) . 'assets/templates/templates.php';

}, 0 );