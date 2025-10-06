<?php
/**
 * pwstrength_meter — Roundcube plugin
 * Adds a live password strength meter on the Roundcube Password plugin screen.
 *
 * @license MIT
 * @version 0.1.0
 */
class pwstrength_meter extends rcube_plugin
{
    public $task = 'settings';
    private $rc;

    function init()
    {
        $this->rc = rcmail::get_instance();

        // Only load on the password change screen within Settings
        $action = (string)$this->rc->action;
        if ($this->rc->task === 'settings' && (strpos($action, 'plugin.password') === 0 || $action === 'password' )) {
            $this->add_texts('localization/', true);
            $this->include_stylesheet('pwstrength_meter.css');
            $this->include_script('js/pwstrength_meter.js');

            // Skin-specific overrides (CSS/JS) if available
            $skin = (string) $this->rc->config->get('skin');
            $skin_base = 'default';
            if (preg_match('/larry/i', $skin)) $skin_base = 'larry';
            elseif (preg_match('/elastic/i', $skin)) $skin_base = 'elastic';
            elseif (preg_match('/classic/i', $skin)) $skin_base = 'classic';

            $skin_dir = $this->home . '/skins/' . $skin_base;
            if (is_dir($skin_dir)) {
                if (file_exists($skin_dir . '/pwstrength_meter.css'))
                    $this->include_stylesheet('skins/' . $skin_base . '/pwstrength_meter.css');
                if (file_exists($skin_dir . '/profile.js'))
                    $this->include_script('skins/' . $skin_base . '/profile.js');
            }

            // Pass environment flags/selectors to JS
            $this->rc->output->set_env('pwstrength_meter_enabled', true);
            
		$this->rc->output->set_env('pwstrength_meter_labels', array(
			'title'   => $this->gettext('pwstrength_title'),
			'veryweak'=> $this->gettext('veryweak'),
			'weak'    => $this->gettext('weak'),
			'fair'    => $this->gettext('fair'),
			'strong'  => $this->gettext('strong'),
			'verystrong' => $this->gettext('verystrong'),
			'note_nextcloud' => $this->gettext('note_nextcloud'),
		));
		}
    }
}
