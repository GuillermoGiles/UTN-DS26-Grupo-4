import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usuarioSchema, type UsuarioFormValues } from '../validations/usuarioSchema';
import { FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

export function AltaUsuario() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            password: ''
        }
    });

    const onSubmit = (data: UsuarioFormValues) => {
        console.log("Usuario registrado exitosamente: ", data);
        navigate('/');
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-md-center">
                <Col md={8} lg={6}>
                    <div className="saas-card-dark p-4 p-md-5">
                        <div className="text-center mb-5">
                            <h2 className="mb-2">Crear Cuenta</h2>
                            <p className="text-muted">Unite a la plataforma de gestión SGI San José</p>
                        </div>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="nombre">
                                        <Form.Label className="small fw-bold text-muted">NOMBRE</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Ej: Juan"
                                                isInvalid={!!errors.nombre}
                                                {...register("nombre")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiUser className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.nombre?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="apellido">
                                        <Form.Label className="small fw-bold text-muted">APELLIDO</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Ej: Pérez"
                                                isInvalid={!!errors.apellido}
                                                {...register("apellido")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiUser className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.apellido?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4" controlId="email">
                                <Form.Label className="small fw-bold text-muted">CORREO ELECTRÓNICO</Form.Label>
                                <div className="position-relative">
                                    <Form.Control 
                                        type="email" 
                                        placeholder="tucorreo@ejemplo.com"
                                        isInvalid={!!errors.email}
                                        {...register("email")} 
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <FiMail className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-5" controlId="password">
                                <Form.Label className="small fw-bold text-muted">CONTRASEÑA</Form.Label>
                                <div className="position-relative">
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Mínimo 6 caracteres"
                                        isInvalid={!!errors.password}
                                        {...register("password")} 
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <FiLock className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <button type="submit" className="w-100 btn-primary-custom d-flex justify-content-center align-items-center gap-2">
                                <FiCheckCircle size={20} /> Finalizar Registro
                            </button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
