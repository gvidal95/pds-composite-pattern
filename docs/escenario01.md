# Escenario 01: 

Una institución necesita representar la estructura de su presupuesto mediante diferentes niveles jerárquicos. 

Existen partidas presupuestarias individuales, que contienen información como código, descripción y valor asignado. Estas partidas representan los elementos básicos sobre los cuales se registran los recursos disponibles. 

Sin embargo, para organizar el presupuesto también existen grupos presupuestarios. Un grupo puede contener varias partidas individuales, pero también puede contener otros grupos presupuestarios, formando una estructura jerárquica de varios niveles. 

Por ejemplo, un grupo denominado Tecnologías de la Información podría contener partidas relacionadas con licenciamiento, infraestructura y servicios. A su vez, el grupo Infraestructura podría contener otros grupos o partidas correspondientes a servidores, almacenamiento y comunicaciones. 

Tanto las partidas individuales como los grupos deben permitir realizar operaciones comunes, entre ellas: 

- obtener su código y descripción; 

- calcular su valor total; 

- mostrar su estructura. 

En una partida individual, el valor total corresponde directamente al valor asignado. En un grupo presupuestario, el valor total corresponde a la suma de los valores de todos los elementos que contiene, incluyendo aquellos que formen parte de grupos internos. 

Actualmente, el código cliente tendría que identificar constantemente si está trabajando con una partida individual o con un grupo para decidir cómo calcular su valor o recorrer sus componentes. Se desea evitar esta distinción y permitir que ambos tipos de elementos puedan tratarse mediante una misma abstracción. 

Además, la estructura debe poder crecer incorporando nuevos niveles de agrupación sin modificar la lógica principal que consulta o procesa el presupuesto. 

Diseñar una solución orientada a objetos que permita representar la estructura jerárquica, realizar operaciones comunes sobre elementos individuales y agrupaciones y calcular recursivamente los valores correspondientes. 