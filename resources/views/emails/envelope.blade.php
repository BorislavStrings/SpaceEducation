<!DOCTYPE html>
<html>
	<head>
	<meta charset="UTF-8">
	<title>Spaceport Envelope</title>
	</head>

	<body>
		<h4>Изпратено от:</h4>
		<p>{{ isset($sender) ? $sender : '' }}</p>
		<br>
		<h4>Текст:</h4>
		<p width="420">{{ isset($content) ? $content : '' }}</p>
	</body>
</html> 